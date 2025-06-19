import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow-md px-6 py-4 mb-8 flex flex-wrap items-center justify-between">
      <div className="flex items-center gap-6 text-gray-800 font-medium">
        <Link to="/" className="hover:text-blue-600 transition">
          Dashboard
        </Link>

        <Link to="/calendar" className="hover:text-blue-600 transition">
          Calendar
        </Link>

        {user?.role === 'admin' && (
          <Link to="/admin" className="hover:text-blue-600 transition">
            Admin Panel
          </Link>
        )}

        <Link to="/monthly-report" className="hover:text-blue-600 transition">
          Monthly Report
        </Link>
      </div>

      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <span className="text-gray-700 font-semibold">{user?.name}</span>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

