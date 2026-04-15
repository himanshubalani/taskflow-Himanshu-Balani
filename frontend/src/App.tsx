import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, Link, NavLink } from 'react-router-dom';
import { CircleUser, Plus, Search, Check, ListFilter, ArrowRight, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// --- API & AUTH CONTEXT ---
const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) throw await res.json();
  return res.status === 204 ? null : res.json();
};

const AuthContext = createContext<any>(null);
const useAuth = () => useContext(AuthContext);

// --- COMPONENT: LOGIN ---
const Login = () => {
  const { login } = useAuth();
  const[email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      login(data.token, data.user);
    } catch (err: any) { setError('Invalid credentials'); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-[13px] text-accent uppercase tracking-[0.12em] font-medium">taskflow</span>
        <span className="bg-accent-light text-accent text-[11px] px-2 py-0.5 rounded-full border border-border">beta</span>
      </div>
      
      <div className="w-full max-w-[360px] bg-surface border border-border rounded-[12px] p-[32px]">
        <h1 className="text-[18px] font-medium mb-1">sign in</h1>
        <p className="text-[12px] text-text-muted mb-[24px]">welcome back to your workbench</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
          {error && <div className="text-[11px] text-priority-high-text">{error}</div>}
          
          <div>
            <label className="label-text">email</label>
            <input type="email" placeholder="you@example.com" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          
          <div>
            <div className="flex justify-between items-end mb-[6px]">
              <label className="label-text !mb-0">password</label>
              <a href="#" className="text-[12px] text-accent hover:underline">forgot password?</a>
            </div>
            <input type="password" placeholder="••••••••" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <button type="submit" className="btn-primary mt-[10px]">sign in <ArrowRight className="w-4 h-4 ml-2" /></button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/register" className="text-[12px] text-text-secondary hover:text-accent transition-colors">no account? register here</Link>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: REGISTER ---
const Register = () => {
  const { login } = useAuth();
  const[formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const pwd = formData.password;
  let strength = 0;
  if (pwd.length > 0) strength = 1;
  if (pwd.length > 5) strength = 2;
  if (pwd.length > 8 && /[0-9]/.test(pwd)) strength = 3;
  if (pwd.length > 10 && /[^a-zA-Z0-9]/.test(pwd)) strength = 4;
  
  const strengthLabels = ['weak', 'weak', 'fair', 'strong', 'strong'];
  const segmentColors = ['bg-[#E24B4A]', 'bg-[#EF9F27]', 'bg-[#1D9E75]', 'bg-[#1D9E75]'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) return setError('Passwords do not match');
    try {
      const data = await fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(formData) });
      login(data.token, data.user);
    } catch (err: any) { setError('Registration failed'); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-[13px] text-accent uppercase tracking-[0.12em] font-medium">taskflow</span>
      </div>
      
      <div className="w-full max-w-[360px] bg-surface border border-border rounded-[12px] p-[32px]">
        <h1 className="text-[18px] font-medium mb-[24px]">register</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
          {error && <div className="text-[11px] text-[#A32D2D]">{error}</div>}
          
          <div>
            <label className="label-text">full name</label>
            <input type="text" className="input-field" onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          
          <div>
            <label className="label-text">email</label>
            <input type="email" className="input-field" onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          
          <div>
            <label className="label-text">password</label>
            <input type="password" className="input-field" onChange={e => setFormData({...formData, password: e.target.value})} required />
            <div className="mt-[6px]">
              <div className="flex gap-[3px] mb-1">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`flex-1 h-[3px] rounded-full border border-border ${i < strength ? segmentColors[strength-1] : 'bg-border-subtle'}`} />
                ))}
              </div>
              {strength > 0 && <span className="text-[11px] text-text-muted">strength: {strengthLabels[strength]}</span>}
            </div>
          </div>
          
          <div>
            <label className="label-text">confirm password</label>
            <input type="password" className="input-field" onChange={e => setFormData({...formData, confirm: e.target.value})} required />
          </div>
          
          <button type="submit" className="btn-primary mt-[10px]">create account <ArrowRight className="w-4 h-4 ml-2" /></button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-[12px] text-text-secondary hover:text-accent transition-colors">already have an account? sign in</Link>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: SHELL (Sidebar & Topbar) ---
const Shell = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => { fetchApi('/projects').then(data => setProjects(data.projects)); },[]);

  const createProject = async () => {
    const name = prompt('Project name:');
    if (!name) return;
    const description = prompt('Project description:') || '';
    const p = await fetchApi('/projects', { method: 'POST', body: JSON.stringify({ name, description }) });
    setProjects([...projects, p]);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Topbar */}
      <header className="fixed top-0 w-full h-[48px] bg-surface border-b border-border flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-8">
          <span className="text-[13px] text-accent uppercase tracking-[0.12em] font-medium">taskflow</span>
          <nav className="flex gap-4">
            {['projects', 'team', 'settings'].map(nav => (
              <a key={nav} href="#" className={`text-[12px] ${nav === 'projects' ? 'text-text-primary border-b-[2px] border-accent py-[13px]' : 'text-text-muted hover:text-text-primary py-[13px]'}`}>{nav}</a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 cursor-pointer" onClick={logout}>
          <span className="text-[12px] text-text-secondary">{user?.name}</span>
          <div className="w-[28px] h-[28px] bg-accent-light border border-accent-mid rounded-full flex items-center justify-center text-accent text-[11px] font-medium">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed top-[48px] left-0 w-[220px] h-[calc(100vh-48px)] bg-surface border-r border-border p-4 overflow-y-auto">
        <div className="text-[11px] uppercase text-text-muted font-medium tracking-[0.08em] px-[10px] mb-2">projects</div>
        <div className="flex flex-col gap-1">
          {projects.map((p, i) => {
            const colors = ['bg-[#E24B4A]', 'bg-[#1D9E75]', 'bg-[#EF9F27]', 'bg-[#534AB7]'];
            const dotColor = colors[i % colors.length];
            return (
              <NavLink key={p.id} to={`/projects/${p.id}`} className={({ isActive }) => `flex items-center justify-between h-[36px] px-[10px] rounded-[8px] border border-transparent transition-colors duration-100 ${isActive ? 'bg-accent-light text-accent-dark font-medium border-accent-mid/30' : 'text-[13px] text-text-primary hover:bg-app'}`}>
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-[8px] h-[8px] rounded-full ${dotColor} border border-border`} />
                      <span className="truncate">{p.name}</span>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
          <button onClick={createProject} className="flex items-center gap-2 h-[36px] px-[10px] rounded-[8px] text-[12px] text-accent hover:bg-accent-light border border-transparent transition-colors duration-100 text-left w-full mt-1">
            <Plus className="w-3 h-3" /> new project
          </button>
        </div>

        <hr className="border-border my-4" />
        <div className="text-[11px] uppercase text-text-muted font-medium tracking-[0.08em] px-[10px] mb-2">filters</div>
        <button className="flex items-center gap-2 h-[36px] px-[10px] rounded-[8px] text-[13px] text-text-primary hover:bg-app border border-transparent transition-colors duration-100 w-full text-left">
          <CircleUser className="w-3.5 h-3.5 text-text-muted" /> assigned to me
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[220px] mt-[48px] w-[calc(100%-220px)] h-[calc(100vh-48px)] overflow-y-auto bg-app">
        {children}
      </main>
    </div>
  );
};

// --- COMPONENT: PROJECT DETAIL (KANBAN) ---
const ProjectBoard = () => {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchProject = () => fetchApi(`/projects/${id}`).then(setProject);
  useEffect(() => { fetchProject(); }, [id]);

  const updateTask = async (taskId: string, status: string) => {
    setProject((prev: any) => ({ ...prev, tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, status } : t) }));
    await fetchApi(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ status }) }).catch(fetchProject);
  };

  const deleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the card click from also changing the task status
    if (!window.confirm('Delete this task?')) return;

    // Optimistic UI update: Remove task instantly
    setProject((prev: any) => ({ 
      ...prev, 
      tasks: prev.tasks.filter((t: any) => t.id !== taskId) 
    }));

    // Make network request. If it fails, re-fetch to revert the UI.
    await fetchApi(`/tasks/${taskId}`, { method: 'DELETE' }).catch(fetchProject);
  };

  const deleteProject = async () => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}" and all its tasks? This cannot be undone.`)) return;
    
    try {
      await fetchApi(`/projects/${id}`, { method: 'DELETE' });
      // Use window.location to force a full re-render so the Shell sidebar re-fetches the project list
      window.location.href = '/'; 
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  if (!project) return <div className="p-8 text-[13px] text-text-muted">Loading project workspace...</div>;

  const cols =[
    { key: 'todo', label: 'to do', color: 'status-todo' },
    { key: 'in_progress', label: 'in progress', color: 'status-in_progress' },
    { key: 'done', label: 'done', color: 'status-done' }
  ];

  const inProgressCount = project.tasks.filter((t: any) => t.status === 'in_progress').length;
  const doneCount = project.tasks.filter((t: any) => t.status === 'done').length;

  return (
    <div className="p-[24px] max-w-[1400px] mx-auto">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-[20px]">
        <div>
          <h2 className="text-[16px] font-medium text-text-primary mb-1">{project.name}</h2>
          <p className="text-[12px] text-text-muted">{project.description || 'No description provided.'}</p>
        </div>
        <div className="flex gap-2">
          {/* NEW: Delete Project Button */}
          <button onClick={deleteProject} className="btn-ghost text-text-hint hover:text-[#E24B4A] hover:bg-[#FCEBEB]">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> delete
          </button>
          
          <button className="btn-ghost"><ListFilter className="w-3.5 h-3.5 mr-1.5" /> filter</button>
          <button className="btn-ghost"><CircleUser className="w-3.5 h-3.5 mr-1.5" /> assign</button>
          <button onClick={() => setShowAdd(true)} className="h-[32px] px-3 bg-accent text-accent-light text-[12px] border border-border rounded-[8px] hover:bg-accent-dark transition-colors ml-2">add task +</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-4 mb-[24px]">
        {[
          { label: 'total tasks', val: project.tasks.length },
          { label: 'in progress', val: inProgressCount },
          { label: 'done', val: doneCount },
          { label: 'next due', val: 'Apr 18' }
        ].map((stat, i) => (
          <div key={i} className="flex-1 bg-surface border border-border rounded-[8px] py-[8px] px-[14px]">
            <div className="text-[18px] font-medium text-text-primary">{stat.val}</div>
            <div className="text-[11px] uppercase text-text-muted font-medium tracking-[0.08em] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-[10px] items-start h-[calc(100vh-240px)]">
        {cols.map(col => {
          const tasks = project.tasks.filter((t: any) => t.status === col.key);
          return (
            <div key={col.key} className="flex-1 bg-surface border border-border rounded-[12px] p-[10px] flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center border-b border-border-subtle pb-[8px] mb-[10px] shrink-0">
                <span className={`text-[12px] uppercase font-medium tracking-[0.08em] text-${col.color}-text`}>{col.label}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border border-border bg-${col.color}-bg text-${col.color}-text`}>{tasks.length}</span>
              </div>
              
              <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {tasks.map((task: any) => (
                  <div key={task.id} 
                    onClick={() => updateTask(task.id, col.key === 'todo' ? 'in_progress' : col.key === 'in_progress' ? 'done' : 'todo')}
                    className={`bg-app border border-border rounded-[8px] p-[10px] mb-[6px] cursor-pointer hover:border-accent-mid transition-colors duration-100 group ${col.key === 'done' ? 'opacity-65' : ''}`}>
                    
                    <div className="flex justify-between items-start mb-3">
                      <div className={`text-[13px] font-medium text-text-primary leading-[1.4] pr-2 ${col.key === 'done' ? 'line-through text-text-muted' : ''}`}>
                        {task.title}
                      </div>
                      
                      {/* Delete Button (appears slightly muted until hovered) */}
                      <button 
                        onClick={(e) => deleteTask(task.id, e)}
                        className="text-text-hint hover:text-[#E24B4A] transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-end">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border border-border bg-priority-${task.priority}-bg text-priority-${task.priority}-text`}>
                        {task.priority}
                      </span>
                      <div className="flex gap-2 items-center">
                        {task.due_date && <span className="text-[11px] text-text-muted">{task.due_date.slice(5, 10)}</span>}
                        <div className="w-[20px] h-[20px] bg-[#E2E0D5] border border-border rounded-full flex items-center justify-center text-[9px] text-text-secondary"> <Check className="w-3.5 h-3.5" /></div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setShowAdd(true)} className="w-full mt-1 h-[32px] rounded-[6px] text-[12px] text-text-hint hover:text-accent hover:bg-accent-light transition-colors border border-transparent text-left px-2">
                  + add task
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-text-primary/10 flex items-center justify-center z-50">
          <form className="w-[400px] bg-surface border border-border rounded-[12px] p-6" 
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const data = Object.fromEntries(fd.entries());
              await fetchApi(`/projects/${id}/tasks`, { method: 'POST', body: JSON.stringify(data) });
              setShowAdd(false);
              fetchProject();
            }}>
            <h3 className="text-[16px] font-medium mb-4">New Task</h3>
            <div className="flex flex-col gap-[14px]">
              <div><label className="label-text">Title</label><input name="title" required className="input-field" autoFocus/></div>
              <div><label className="label-text">Priority</label>
                <select name="priority" className="input-field bg-white"><option>low</option><option selected>medium</option><option>high</option></select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost !w-auto">Cancel</button>
              <button type="submit" className="btn-primary !w-auto !px-6">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// --- APP ROUTER ---
export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };
  const logout = () => { localStorage.clear(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={user ? <Shell><div className="p-8 text-[13px] text-text-muted">Select a project from the sidebar to begin.</div></Shell> : <Navigate to="/login" />} />
          <Route path="/projects/:id" element={user ? <Shell><ProjectBoard /></Shell> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}