-- migrate:up
-- Password is 'password123' (bcrypt cost 12)
INSERT INTO users (id, name, email, password) VALUES 
('11111111-1111-1111-1111-111111111111', 'Test User', 'test@example.com', '$2a$12$7k3d9g5H5m/1rY9aQp5nF.Yq0CqG0F6kC/8Y6E1G6M/8T/8Z0A/4W');

INSERT INTO projects (id, name, description, owner_id) VALUES 
('22222222-2222-2222-2222-222222222222', 'Core Web Vitals', 'Improve application performance metrics.', '11111111-1111-1111-1111-111111111111');

INSERT INTO tasks (title, description, status, priority, project_id, assignee_id) VALUES 
('Optimize Images', 'Compress PNGs', 'todo', 'high', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
('Implement Redis Cache', 'Cache expensive DB calls', 'in_progress', 'medium', '22222222-2222-2222-2222-222222222222', NULL),
('Audit Lighthouse', 'Run lighthouse scores in CI', 'done', 'low', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111');

-- migrate:down
DELETE FROM users WHERE email = 'test@example.com';