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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">📅 Monthly Report</h2>

        <div className="flex flex-wrap gap-4 mb-6 items-center">
          {user.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Employee</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="border px-3 py-2 rounded-lg bg-white shadow-sm"
              >
                <option value="" disabled>Select</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Select Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border px-3 py-2 rounded-lg shadow-sm"
            />
          </div>

          <div className="mt-6 md:mt-0">
            <button
              onClick={exportCSV}
              className="mt-6 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">📊 Summary</h3>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>Total Days Marked: {summary.total}</li>
            <li>Full Days (In & Out): {summary.fullDays}</li>
            <li>Half Days (Only In): {summary.halfDays}</li>
            <li>Total Worked Hours: {summary.totalHours}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">📋 Attendance Details</h3>
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
                {attendance.map(record => {
                  let duration = '—';
                  if (record.checkIn && record.checkOut) {
                    const start = moment(record.checkIn, 'HH:mm');
                    const end = moment(record.checkOut, 'HH:mm');
                    const diff = moment.duration(end.diff(start));
                    duration = `${Math.floor(diff.asHours())}h ${diff.minutes()}m`;
                  }

                  return (
                    <tr key={record._id} className="bg-white border-t text-gray-700">
                      <td className="px-4 py-2 border">{record.date}</td>
                      <td className="px-4 py-2 border">{record.checkIn || '—'}</td>
                      <td className="px-4 py-2 border">{record.checkOut || '—'}</td>
                      <td className="px-4 py-2 border">{duration}</td>
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

export default MonthlyReport;


