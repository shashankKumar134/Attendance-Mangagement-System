import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment';
import api from '../api';

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

  const getTileClassName = ({ date }) => {
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
    <div style={{ padding: '2rem' }}>
      <h2>Attendance Calendar</h2>
      <Calendar
        onClickDay={handleDateClick}
        tileClassName={getTileClassName}
      />

      {selectedDate && (
        <div style={{ marginTop: '1rem' }}>
          <h4>{selectedDate}</h4>
          {details ? (
            <>
              <p>Check-In: {details.checkIn || '—'}</p>
              <p>Check-Out: {details.checkOut || '—'}</p>
            </>
          ) : (
            <p>No attendance for this day</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
