import React from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid" // a plugin!
import iCalendarPlugin from "@fullcalendar/icalendar"
import "../../styles/calendar.css"

class CalendarComponent extends React.Component {
  render() {
    const calendarStyle = {
      width: "80%",
      maxWidth: "960px",
      margin: "20px auto",
    }
    return (
      <div style={calendarStyle} className="calendar">
        <FullCalendar
          plugins={[dayGridPlugin, iCalendarPlugin]}
          events={{
            url: "https://ical.nbtca.space/",
            format: "ics",
            success: function (data) {
              data.forEach((element) => {
                element.color = element.title.includes("生日") ? "#fc7399" : "#5172dc"
              })
            },
          }}
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: false,
          }}
          height="600px"
        />
      </div>
    )
  }
}

export default CalendarComponent
