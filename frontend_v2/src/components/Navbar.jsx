import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex space-x-6">
            <Link 
              to="/dashboard" 
              className={`${location.pathname === '/dashboard' ? 'text-blue-600 font-bold' : 'text-gray-700'} hover:text-blue-600`}
            >
              Dashboard
            </Link>
            <Link 
              to="/projects" 
              className={`${location.pathname === '/projects' ? 'text-blue-600 font-bold' : 'text-gray-700'} hover:text-blue-600`}
            >
              Projects
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;