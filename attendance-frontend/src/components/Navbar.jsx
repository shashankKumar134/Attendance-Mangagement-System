import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={{ background: '#eee', padding: '1rem', marginBottom: '2rem' }}>
      <Link to="/">Dashboard</Link>

      <Link to="/calendar" style={{ marginLeft: '1rem' }}>
        Calendar
      </Link>

      {user?.role === 'admin' && (
        <Link to="/admin" style={{ marginLeft: '1rem' }}>
          Admin Panel
        </Link>
      )}

      <Link to="/monthly-report" style={{ marginLeft: '1rem' }}>
        Monthly Report
      </Link>


      <span style={{ marginLeft: '1rem', marginRight: '1rem' }}>
        {user?.name}
      </span>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}

export default Navbar;

