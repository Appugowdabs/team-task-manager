const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = function(app) {
    
    // GET /api/v2/auth/me - Get current user
    app.get('/api/v2/auth/me', async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });
        
        const { data, error } = await supabase.auth.getUser(token);
        if (error) return res.status(401).json({ error: error.message });
        
        res.json({ user: data.user });
    });
    
    // POST /api/v2/auth/login
    app.post('/api/v2/auth/login', async (req, res) => {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return res.status(400).json({ error: error.message });
        res.json({ user: data.user, session: data.session });
    });
    
    // POST /api/v2/auth/signup
    app.post('/api/v2/auth/signup', async (req, res) => {
        const { email, password, full_name } = req.body;
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name } }
        });
        if (error) return res.status(400).json({ error: error.message });
        
        if (data.user) {
            await supabase.from('users').insert([{ 
                id: data.user.id, email, full_name, is_admin: false 
            }]);
        }
        res.json({ user: data.user, message: 'Signup successful!' });
    });
    
    // GET /api/v2/projects
    app.get('/api/v2/projects', async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        
        const { data: user } = await supabase.auth.getUser(token);
        if (!user) return res.status(401).json({ error: 'Invalid token' });
        
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('created_by', user.user.id);
        
        if (error) return res.status(400).json({ error: error.message });
        res.json(data || []);
    });
    
    // POST /api/v2/projects
    app.post('/api/v2/projects', async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        
        const { data: user } = await supabase.auth.getUser(token);
        if (!user) return res.status(401).json({ error: 'Invalid token' });
        
        const { name, description } = req.body;
        const { data, error } = await supabase
            .from('projects')
            .insert([{ name, description, created_by: user.user.id }])
            .select()
            .single();
        
        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    });
    
    // GET /api/v2/my-tasks
    app.get('/api/v2/my-tasks', async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        
        const { data: user } = await supabase.auth.getUser(token);
        if (!user) return res.status(401).json({ error: 'Invalid token' });
        
        const { data, error } = await supabase
            .from('tasks')
            .select('*, projects(name)')
            .eq('assigned_to', user.user.id);
        
        if (error) return res.status(400).json({ error: error.message });
        
        const today = new Date().toISOString().split('T')[0];
        const overdue = data.filter(t => t.due_date && t.due_date < today && t.status !== 'done');
        
        res.json({
            tasks: data || [],
            todo_count: data.filter(t => t.status === 'todo').length,
            in_progress_count: data.filter(t => t.status === 'in_progress').length,
            done_count: data.filter(t => t.status === 'done').length,
            overdue_count: overdue.length
        });
    });
    
    // GET /api/v2/projects/:projectId/tasks
    app.get('/api/v2/projects/:projectId/tasks', async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        
        const { projectId } = req.params;
        const { data, error } = await supabase
            .from('tasks')
            .select('*, users!assigned_to(full_name, email)')
            .eq('project_id', projectId);
        
        if (error) return res.status(400).json({ error: error.message });
        res.json(data || []);
    });
    
    // POST /api/v2/projects/:projectId/tasks
    app.post('/api/v2/projects/:projectId/tasks', async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        
        const { data: user } = await supabase.auth.getUser(token);
        const { projectId } = req.params;
        const { title, description, assigned_to, due_date, priority } = req.body;
        
        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                title, description, project_id: parseInt(projectId),
                assigned_to, created_by: user.user.id, due_date, priority
            }])
            .select()
            .single();
        
        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    });
    
    // PUT /api/v2/tasks/:taskId/status
    app.put('/api/v2/tasks/:taskId/status', async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        
        const { taskId } = req.params;
        const { status } = req.body;
        
        const { data, error } = await supabase
            .from('tasks')
            .update({ status, updated_at: new Date() })
            .eq('id', taskId)
            .select()
            .single();
        
        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    });
    
    // GET /api/v2/users
    app.get('/api/v2/users', async (req, res) => {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name');
        
        if (error) return res.status(400).json({ error: error.message });
        res.json(data || []);
    });
};