import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import MonthlyReport from './pages/MonthlyReport';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar'; // ✅ Import Navbar
import CalendarPage from './pages/CalendarPage';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      {user && <Navbar />} {/* ✅ Show only when logged in */}

      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={user ? <CalendarPage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/monthly-report" element={user ? <MonthlyReport /> : <Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
