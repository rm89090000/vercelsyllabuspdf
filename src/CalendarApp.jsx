import React, { useState } from "react";

function CalendarApp() {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleUpload = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        body: fileInput.files[0] // send the raw file
      });

      const data = await res.json();
      if (data.error) {
        alert("Failed to parse PDF: " + data.error);
        return;
      }
      setEvents(data.events || []);
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Error uploading file. Check console for details.");
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="day empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const dayEvents = events.filter(ev => ev.date === dayStr);

      days.push(
        <div key={d} className="day">
          <div className="day-number">{d}</div>
          {dayEvents.map((ev, idx) => (
            <div key={idx} className="event">{ev.title}</div>
          ))}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="app-container">
      <h1>Syllabus → Calendar</h1>

      <div className="upload-box">
        <form onSubmit={handleUpload} className="upload-form">
          <label>Upload your PDF syllabus(s):</label>
          <input type="file" id="fileInput" accept=".pdf" required />
          <button type="submit">Upload & Parse</button>
        </form>
      </div>

      <div id="calendar">
        <div className="calendar-header">
          <button onClick={() => {
            setCurrentMonth(prev => {
              if (prev === 0) {
                setCurrentYear(y => y - 1);
                return 11;
              }
              return prev - 1;
            });
          }}>Prev</button>

          <div id="monthYear">{`${monthNames[currentMonth]} ${currentYear}`}</div>

          <button onClick={() => {
            setCurrentMonth(prev => {
              if (prev === 11) {
                setCurrentYear(y => y + 1);
                return 0;
              }
              return prev + 1;
            });
          }}>Next</button>
        </div>

        <div className="calendar-grid">{renderCalendarDays()}</div>
      </div>
    </div>
  );
}

export default CalendarApp;
