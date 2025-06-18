import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function AdminPanel() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    } else {
      fetchAllAttendance();
    }
  }, [user]);

  const fetchAllAttendance = async () => {
    try {
      const res = await api.get('/attendance/all');
      setRecords(res.data);
      setFilteredRecords(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching attendance');
    }
  };

  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = records.filter(record =>
      record.userId?.name?.toLowerCase().includes(lower) ||
      record.userId?.email?.toLowerCase().includes(lower) ||
      record.date.includes(lower)
    );
    setFilteredRecords(filtered);
  }, [search, records]);

  const exportCSV = () => {
    const header = 'Name,Email,Date,Check-In,Check-Out\n';
    const rows = filteredRecords.map(r =>
      `${r.userId?.name || ''},${r.userId?.email || ''},${r.date},${r.checkIn || ''},${r.checkOut || ''}`
    );
    const csv = header + rows.join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance_records.csv';
    link.click();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Panel</h2>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout} style={{ marginBottom: '1rem' }}>Logout</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by name, email or date"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem', width: '300px' }}
        />
        <button onClick={exportCSV} style={{ marginLeft: '1rem' }}>
          Export CSV
        </button>
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Date</th>
            <th>Check-In</th>
            <th>Check-Out</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map(record => (
            <tr key={record._id}>
              <td>{record.userId?.name || '—'}</td>
              <td>{record.userId?.email || '—'}</td>
              <td>{record.date}</td>
              <td>{record.checkIn || '—'}</td>
              <td>{record.checkOut || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPanel;

