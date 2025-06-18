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
    <div style={{ padding: '2rem' }}>
      <h2>Welcome, {user.name}</h2>
      <p>Role: {user.role}</p>

      <button onClick={() => handleAction('checkin')}>Check In</button>
      <button onClick={() => handleAction('checkout')} style={{ marginLeft: '10px' }}>
        Check Out
      </button>
      <button onClick={logout} style={{ marginLeft: '10px' }}>Logout</button>

      {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}

      <h3 style={{ marginTop: '2rem' }}>📊 Monthly Summary (This Month)</h3>
      <ul>
        <li>Total Days Marked: {summary.total}</li>
        <li>Full Days (In & Out): {summary.fullDays}</li>
        <li>Half Days (Only In): {summary.halfDays}</li>
      </ul>

      <h3 style={{ marginTop: '2rem' }}>Attendance Records</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Worked Hours</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => {
            const underworked = isUnderWorked(record.checkIn, record.checkOut);
            return (
              <tr
                key={record._id}
                style={{ backgroundColor: underworked ? '#ffe5e5' : 'transparent' }}
              >
                <td>{moment(record.date).format('YYYY-MM-DD')}</td>
                <td>{record.checkIn || '—'}</td>
                <td>{record.checkOut || '—'}</td>
                <td>{calculateWorkedHours(record.checkIn, record.checkOut)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;


