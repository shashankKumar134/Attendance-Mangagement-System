import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // React Calendar default styles
import moment from 'moment';
import api from '../api';
import './calendarStyles.css'; // Custom tile styles

function CalendarPage() {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance/me');
        setAttendance(res.data);
      } catch (err) {
        console.error('Failed to load attendance:', err.message);
      }
    };

    fetchAttendance();
  }, []);

  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return;
    const dateStr = moment(date).format('YYYY-MM-DD');
    const record = attendance.find((a) => a.date === dateStr);

    if (record) {
      if (record.checkIn && record.checkOut) return 'present-day';
      if (record.checkIn) return 'half-day';
    }

    return null;
  };

  const handleDateClick = (date) => {
    const dateStr = moment(date).format('YYYY-MM-DD');
    const record = attendance.find((a) => a.date === dateStr);
    setSelectedDate(dateStr);
    setDetails(record || null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">🗓️ Attendance Calendar</h2>

        <Calendar
          onClickDay={handleDateClick}
          tileClassName={getTileClassName}
          className="react-calendar mx-auto"
        />

        {selectedDate && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">{selectedDate}</h4>
            {details ? (
              <>
                <p><span className="font-medium">Check-In:</span> {details.checkIn || '—'}</p>
                <p><span className="font-medium">Check-Out:</span> {details.checkOut || '—'}</p>
              </>
            ) : (
              <p className="text-gray-500">No attendance for this day</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarPage;
