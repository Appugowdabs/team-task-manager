import { useState, useEffect } from 'react';

function Dashboard({ token }) {
  const [stats, setStats] = useState({
    tasks: [],
    todo_count: 0,
    in_progress_count: 0,
    done_count: 0,
    overdue_count: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v2/my-tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Tasks To Do</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.todo_count}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">In Progress</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.in_progress_count}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{stats.done_count}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Overdue</h3>
          <p className="text-3xl font-bold text-red-600">{stats.overdue_count}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">My Tasks</h2>
        </div>
        <div className="divide-y">
          {stats.tasks.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">No tasks assigned yet</p>
          ) : (
            stats.tasks.map(task => {
              const isOverdue = task.due_date && task.due_date < new Date().toISOString().split('T')[0] && task.status !== 'done';
              
              return (
                <div key={task.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-500">Project: {task.projects?.name}</span>
                        {task.due_date && (
                          <span className={`${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                            Due: {new Date(task.due_date).toLocaleDateString()}
                            {isOverdue && ' ⚠️ OVERDUE'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === 'todo' ? 'bg-yellow-100 text-yellow-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.status === 'todo' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Done'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;