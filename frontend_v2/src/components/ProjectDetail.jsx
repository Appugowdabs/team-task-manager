import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ProjectDetail({ token }) {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`https://team-task-manager-6e7h.onrender.com/api/v2/projects/${id}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://team-task-manager-6e7h.onrender.com/api/v2/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://team-task-manager-6e7h.onrender.com/api/v2/projects/${id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      });
      if (response.ok) {
        setShowTaskModal(false);
        setNewTask({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });
        fetchTasks();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await fetch(`https://team-task-manager-6e7h.onrender.com/api/v2/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchTasks();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading tasks...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Tasks</h1>
        <button
          onClick={() => setShowTaskModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Add Task
        </button>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No tasks yet. Create one!</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{task.title}</h3>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Assigned to: {task.users?.full_name || 'Unassigned'}</span>
                    {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                    <span>Priority: {task.priority}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="px-3 py-1 border rounded"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={createTask}>
              <input
                type="text"
                placeholder="Task Title"
                className="w-full px-3 py-2 border rounded mb-3"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full px-3 py-2 border rounded mb-3"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <select
                className="w-full px-3 py-2 border rounded mb-3"
                value={newTask.assigned_to}
                onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                required
              >
                <option value="">Assign to...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>
                ))}
              </select>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded mb-3"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
              <select
                className="w-full px-3 py-2 border rounded mb-3"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;