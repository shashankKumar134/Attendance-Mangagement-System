import { useEffect, useState, useContext } from 'react';
import moment from 'moment';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

function MonthlyReport() {
  const { user } = useContext(AuthContext);

  const [attendance, setAttendance] = useState([]);
  const [month, setMonth] = useState(moment().format('YYYY-MM'));
  const [summary, setSummary] = useState({
    total: 0,
    fullDays: 0,
    halfDays: 0,
    totalHours: '0h 0m'
  });
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(user.role === 'admin' ? '' : user.id);

  useEffect(() => {
    if (user.role === 'admin') {
      api.get('/auth/users')
        .then(res => setUsers(res.data))
        .catch(err => console.error('Error fetching users:', err.message));
    }
  }, [user]);

  useEffect(() => {
    if (userId) fetchMonthlyAttendance();
  }, [month, userId]);

  const fetchMonthlyAttendance = async () => {
    try {
      const res = await api.get(`/attendance/me?userId=${userId}`);
      const filtered = res.data.filter(record => record.date.startsWith(month));
      setAttendance(filtered);
      computeSummary(filtered);
    } catch (err) {
      console.error('Error loading attendance:', err.message);
    }
  };

  const computeSummary = (records) => {
    const fullDays = records.filter(r => r.checkIn && r.checkOut).length;
    const halfDays = records.filter(r => r.checkIn && !r.checkOut).length;
    const total = records.length;
    let totalMinutes = 0;

    records.forEach(r => {
      if (r.checkIn && r.checkOut) {
        const start = moment(r.checkIn, 'HH:mm');
        const end = moment(r.checkOut, 'HH:mm');
        const duration = moment.duration(end.diff(start));
        totalMinutes += duration.asMinutes();
      }
    });

    setSummary({
      total,
      fullDays,
      halfDays,
      totalHours: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
    });
  };

  const exportCSV = () => {
    const header = 'Date,Check-In,Check-Out,Worked Hours\n';
    const rows = attendance.map(r => {
      const hours = (r.checkIn && r.checkOut)
        ? moment.duration(moment(r.checkOut, 'HH:mm').diff(moment(r.checkIn, 'HH:mm')))
        : null;

      const duration = hours ? `${Math.floor(hours.asHours())}h ${hours.minutes()}m` : '—';
      return `${r.date},${r.checkIn || '—'},${r.checkOut || '—'},${duration}`;
    });

    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `monthly_report_${month}_${userId}.csv`;
    link.click();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📅 Monthly Report</h2>

      <div style={{ marginBottom: '1rem' }}>
        {user.role === 'admin' && (
          <>
            <label>Select Employee: </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={{ marginRight: '1rem' }}
            >
              <option value="" disabled>Select</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </>
        )}

        <label>Select Month: </label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />

        <button onClick={exportCSV} style={{ marginLeft: '1rem' }}>
          Export CSV
        </button>
      </div>

      <h3>📊 Summary</h3>
      <ul>
        <li>Total Days Marked: {summary.total}</li>
        <li>Full Days (In & Out): {summary.fullDays}</li>
        <li>Half Days (Only In): {summary.halfDays}</li>
        <li>Total Worked Hours: {summary.totalHours}</li>
      </ul>

      <h3>📋 Attendance Details</h3>
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
          {attendance.map(record => {
            let duration = '—';
            if (record.checkIn && record.checkOut) {
              const start = moment(record.checkIn, 'HH:mm');
              const end = moment(record.checkOut, 'HH:mm');
              const diff = moment.duration(end.diff(start));
              duration = `${Math.floor(diff.asHours())}h ${diff.minutes()}m`;
            }

            return (
              <tr key={record._id}>
                <td>{record.date}</td>
                <td>{record.checkIn || '—'}</td>
                <td>{record.checkOut || '—'}</td>
                <td>{duration}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default MonthlyReport;

