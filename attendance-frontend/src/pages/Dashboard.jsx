import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import moment from 'moment';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  const [attendance, setAttendance] = useState([]);
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState({
    total: 0,
    fullDays: 0,
    halfDays: 0,
  });

  const calculateWorkedHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '—';

    const start = moment(checkIn, 'HH:mm');
    const end = moment(checkOut, 'HH:mm');
    const duration = moment.duration(end.diff(start));

    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    return `${hours}h ${minutes}m`;
  };

  const isUnderWorked = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return false;

    const start = moment(checkIn, 'HH:mm');
    const end = moment(checkOut, 'HH:mm');
    const duration = moment.duration(end.diff(start));
    return duration.asHours() < 8;
  };

  const computeSummary = (records) => {
    const currentMonth = moment().format('YYYY-MM');
    const filtered = records.filter(r => r.date.startsWith(currentMonth));

    const fullDays = filtered.filter(r => r.checkIn && r.checkOut).length;
    const halfDays = filtered.filter(r => r.checkIn && !r.checkOut).length;

    setSummary({
      total: filtered.length,
      fullDays,
      halfDays,
    });
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/me');
      setAttendance(res.data);
      computeSummary(res.data);
    } catch (err) {
      console.error('Error fetching attendance:', err.message);
    }
  };

  const handleAction = async (type) => {
    try {
      const res = await api.post(`/attendance/${type}`);
      setMessage(res.data.message);
      fetchAttendance();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Action failed');
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome, {user.name}</h2>
            <p className="text-gray-600">Role: {user.role}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-4 flex-wrap mb-4">
          <button
            onClick={() => handleAction('checkin')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Check In
          </button>
          <button
            onClick={() => handleAction('checkout')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Check Out
          </button>
        </div>

        {message && (
          <div className="mb-4 text-green-600 font-semibold">{message}</div>
        )}

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">📊 Monthly Summary (This Month)</h3>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>Total Days Marked: {summary.total}</li>
            <li>Full Days (In & Out): {summary.fullDays}</li>
            <li>Half Days (Only In): {summary.halfDays}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">📅 Attendance Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Check-In</th>
                  <th className="px-4 py-2 border">Check-Out</th>
                  <th className="px-4 py-2 border">Worked Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => {
                  const underworked = isUnderWorked(record.checkIn, record.checkOut);
                  return (
                    <tr
                      key={record._id}
                      className={`text-gray-800 ${underworked ? 'bg-red-100' : 'bg-white'} border-t`}
                    >
                      <td className="px-4 py-2 border">{moment(record.date).format('YYYY-MM-DD')}</td>
                      <td className="px-4 py-2 border">{record.checkIn || '—'}</td>
                      <td className="px-4 py-2 border">{record.checkOut || '—'}</td>
                      <td className="px-4 py-2 border">
                        {calculateWorkedHours(record.checkIn, record.checkOut)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;



