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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🛠️ Admin Panel</h2>
            <p className="text-gray-600">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {error && <p className="text-red-600 font-medium mb-4">{error}</p>}

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, email or date"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-lg shadow-sm w-full sm:w-96"
          />
          <button
            onClick={exportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Check-In</th>
                <th className="px-4 py-2 border">Check-Out</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record._id} className="bg-white border-t text-gray-700">
                  <td className="px-4 py-2 border">{record.userId?.name || '—'}</td>
                  <td className="px-4 py-2 border">{record.userId?.email || '—'}</td>
                  <td className="px-4 py-2 border">{record.date}</td>
                  <td className="px-4 py-2 border">{record.checkIn || '—'}</td>
                  <td className="px-4 py-2 border">{record.checkOut || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No attendance records found.</p>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;


