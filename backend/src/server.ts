import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const app = express();
app.use(express.json());
app.use(cors());

// Database setup
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.info('SIGTERM signal received. Closing db pool...');
  await pool.end();
  process.exit(0);
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Types
declare global { namespace Express { interface Request { user?: { id: string, email: string } } } }

// Middleware: Auth
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'forbidden' });
    req.user = user as any;
    next();
  });
};

// ==== AUTH ROUTES ====
const registerSchema = z.object({ name: z.string(), email: z.string().email(), password: z.string().min(6) });
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(password, 12); // bcrypt cost 12
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',[name, email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'validation failed', fields: err.flatten().fieldErrors });
    res.status(400).json({ error: 'Email likely exists' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'internal server error' });
  }
});

app.use(authenticateToken); // Protect routes below

// ==== PROJECT ROUTES ====
app.get('/projects', async (req, res) => {
  const result = await pool.query(
    `SELECT DISTINCT p.* FROM projects p 
     LEFT JOIN tasks t ON p.id = t.project_id 
     WHERE p.owner_id = $1 OR t.assignee_id = $1`, [req.user!.id]
  );
  res.json({ projects: result.rows });
});

app.post('/projects', async (req, res) => {
  const schema = z.object({ name: z.string(), description: z.string().optional() });
  try {
    const { name, description } = schema.parse(req.body);
    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',[name, description, req.user!.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(400).json({ error: 'validation failed', fields: err.flatten?.().fieldErrors });
  }
});

app.get('/projects/:id', async (req, res) => {
  const pResult = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
  if (!pResult.rows.length) return res.status(404).json({ error: 'not found' });
  
  const tResult = await pool.query('SELECT * FROM tasks WHERE project_id = $1', [req.params.id]);
  res.json({ ...pResult.rows[0], tasks: tResult.rows });
});

app.delete('/projects/:id', async (req, res) => {
  const result = await pool.query('DELETE FROM projects WHERE id = $1 AND owner_id = $2 RETURNING id',[req.params.id, req.user!.id]);
  if (!result.rows.length) return res.status(403).json({ error: 'forbidden or not found' });
  res.status(204).send();
});

// ==== TASK ROUTES ====
app.post('/projects/:id/tasks', async (req, res) => {
  const schema = z.object({ title: z.string(), description: z.string().optional(), priority: z.enum(['low', 'medium', 'high']).default('medium') });
  try {
    const { title, description, priority } = schema.parse(req.body);
    const result = await pool.query(
      'INSERT INTO tasks (title, description, priority, project_id) VALUES ($1, $2, $3, $4) RETURNING *',[title, description, priority, req.params.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(400).json({ error: 'validation failed' });
  }
});

app.patch('/tasks/:id', async (req, res) => {
  const { status } = req.body; // Simplified for brevity. You can expand to handle full PATCH payload mapping.
  const result = await pool.query('UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'not found' });
  res.json(result.rows[0]);
});

app.delete('/tasks/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]); // Note: In production, check owner permissions here
  res.status(204).send();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));