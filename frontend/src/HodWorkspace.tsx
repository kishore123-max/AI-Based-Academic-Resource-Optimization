import { type FormEvent, useState } from 'react'
import './hod.css'

type HodSection = 'resources' | 'bookings' | 'schedules'
type DepartmentResource = { id: string; name: string; type: 'Classroom' | 'Lab' | 'Equipment'; available: number; total: number; unit: string }
type Booking = { id: string; requester: string; space: string; type: 'Room' | 'Lab'; date: string; time: string; attendees: number; status: 'Pending' | 'Approved' | 'Declined' }
type FacultySchedule = { id: string; faculty: string; course: string; venue: string; day: string; time: string }

const departments = ['Computer Engineering', 'Electronics', 'Mechanical Engineering']
const initialResources: DepartmentResource[] = [
  { id: 'R-01', name: 'Smart classroom 204', type: 'Classroom', available: 1, total: 6, unit: 'rooms' },
  { id: 'R-02', name: 'Embedded systems lab', type: 'Lab', available: 2, total: 8, unit: 'sessions' },
  { id: 'R-03', name: 'Projector pool', type: 'Equipment', available: 3, total: 20, unit: 'devices' },
  { id: 'R-04', name: 'Computer lab 3', type: 'Lab', available: 7, total: 10, unit: 'sessions' },
]
const initialBookings: Booking[] = [
  { id: 'BK-240', requester: 'Dr. Anika Rao', space: 'Embedded systems lab', type: 'Lab', date: 'Oct 12, 2026', time: '10:00 AM – 12:00 PM', attendees: 28, status: 'Pending' },
  { id: 'BK-241', requester: 'Prof. Dev Mehta', space: 'Smart classroom 204', type: 'Room', date: 'Oct 13, 2026', time: '2:00 PM – 4:00 PM', attendees: 52, status: 'Pending' },
  { id: 'BK-238', requester: 'Dr. Nisha Kulkarni', space: 'Computer lab 3', type: 'Lab', date: 'Oct 10, 2026', time: '9:00 AM – 11:00 AM', attendees: 24, status: 'Approved' },
]
const initialSchedules: FacultySchedule[] = [
  { id: 'SCH-01', faculty: 'Dr. Anika Rao', course: 'Data Structures · CE204', venue: 'Room 204', day: 'Monday', time: '09:00 – 10:00' },
  { id: 'SCH-02', faculty: 'Prof. Dev Mehta', course: 'Embedded Systems · EC310', venue: 'Embedded Lab', day: 'Tuesday', time: '11:00 – 13:00' },
  { id: 'SCH-03', faculty: 'Dr. Nisha Kulkarni', course: 'Algorithms · CE302', venue: 'Room 108', day: 'Wednesday', time: '14:00 – 15:00' },
]

export default function HodWorkspace() {
  const [section, setSection] = useState<HodSection>('resources')
  const [department, setDepartment] = useState(departments[0])
  const [resources, setResources] = useState(initialResources)
  const [bookings, setBookings] = useState(initialBookings)
  const [schedules, setSchedules] = useState(initialSchedules)
  const [notice, setNotice] = useState('')
  const shortageCount = resources.filter((resource) => resource.available <= 2 || resource.available / resource.total < 0.25).length
  const pendingCount = bookings.filter((booking) => booking.status === 'Pending').length

  function updateBooking(id: string, status: 'Approved' | 'Declined') {
    setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status } : booking))
    setNotice(`Booking ${id} ${status.toLowerCase()}.`)
  }

  function updateAvailability(id: string, change: number) {
    setResources((current) => current.map((resource) => resource.id === id
      ? { ...resource, available: Math.min(resource.total, Math.max(0, resource.available + change)) }
      : resource))
  }

  function addSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const faculty = String(values.get('faculty') ?? '').trim()
    const course = String(values.get('course') ?? '').trim()
    const venue = String(values.get('venue') ?? '').trim()
    if (!faculty || !course || !venue) return
    setSchedules((current) => [{
      id: `SCH-${Date.now()}`,
      faculty,
      course,
      venue,
      day: String(values.get('day')),
      time: String(values.get('time')),
    }, ...current])
    form.reset()
    setNotice('Faculty schedule added.')
  }

  return (
    <>
      <section className="page-heading hod-heading">
        <div><p className="eyebrow">DEPARTMENT OPERATIONS</p><h1>HOD / Department</h1><p className="subheading">Monitor capacity, review bookings, and coordinate faculty schedules.</p></div>
        <label className="hod-department-select">Department<select value={department} onChange={(event) => setDepartment(event.target.value)}>{departments.map((item) => <option key={item}>{item}</option>)}</select></label>
      </section>
      <section className="hod-metrics" aria-label="Department status">
        <article><span>RESOURCE SHORTAGES</span><strong className={shortageCount ? 'hod-alert-value' : ''}>{shortageCount}</strong><small>items need attention</small></article>
        <article><span>PENDING BOOKINGS</span><strong>{pendingCount}</strong><small>room and lab requests</small></article>
        <article><span>FACULTY SCHEDULES</span><strong>{schedules.length}</strong><small>entries this week</small></article>
      </section>
      <nav className="hod-tabs" aria-label="Department workspace">
        {([['resources', 'Department resources'], ['bookings', `Booking approvals${pendingCount ? ` · ${pendingCount}` : ''}`], ['schedules', 'Faculty schedules']] as const).map(([key, label]) => <button type="button" key={key} className={section === key ? 'hod-tab active' : 'hod-tab'} aria-current={section === key ? 'page' : undefined} onClick={() => { setSection(key); setNotice('') }}>{label}</button>)}
      </nav>
      {notice && <p className="notice" role="status">{notice}</p>}
      {section === 'resources' && <section className="hod-panel">
        <div className="hod-panel-heading"><div><h2>Resource availability</h2><p>{department} · live department inventory</p></div><span className="hod-updated">Updated just now</span></div>
        <div className="hod-resource-list">{resources.map((resource) => {
          const isShort = resource.available <= 2 || resource.available / resource.total < 0.25
          return <article className="hod-resource-row" key={resource.id}><div className="hod-resource-copy"><span className="hod-resource-type">{resource.type}</span><strong>{resource.name}</strong><small>{resource.available} of {resource.total} {resource.unit} available</small></div><div className="hod-resource-track" role="progressbar" aria-label={`${resource.name} availability`} aria-valuemin={0} aria-valuemax={resource.total} aria-valuenow={resource.available}><i className={isShort ? 'shortage' : ''} style={{ width: `${resource.available / resource.total * 100}%` }} /></div><span className={isShort ? 'hod-resource-status shortage' : 'hod-resource-status'}>{isShort ? 'Shortage' : 'Available'}</span><div className="hod-stepper"><button type="button" aria-label={`Decrease ${resource.name} availability`} onClick={() => updateAvailability(resource.id, -1)}>−</button><button type="button" aria-label={`Increase ${resource.name} availability`} onClick={() => updateAvailability(resource.id, 1)}>+</button></div></article>
        })}</div>
        {shortageCount > 0 && <div className="hod-shortage-note"><strong>{shortageCount} resources need attention</strong><span>Low capacity is flagged when availability falls below 25% or two units.</span></div>}
      </section>}
      {section === 'bookings' && <section className="hod-panel">
        <div className="hod-panel-heading"><div><h2>Room & lab bookings</h2><p>Approve requests for department spaces.</p></div><span className="hod-count-tag">{pendingCount} awaiting decision</span></div>
        <div className="hod-booking-list">{bookings.map((booking) => <article className="hod-booking" key={booking.id}><div className="hod-booking-main"><span className="hod-booking-type">{booking.type} · {booking.id}</span><strong>{booking.space}</strong><small>Requested by {booking.requester}</small></div><div className="hod-booking-detail"><span>{booking.date}</span><span>{booking.time}</span><span>{booking.attendees} attendees</span></div><div className={`hod-booking-status ${booking.status.toLowerCase()}`}>{booking.status}</div>{booking.status === 'Pending' && <div className="hod-booking-actions"><button type="button" className="hod-approve" onClick={() => updateBooking(booking.id, 'Approved')}>Approve</button><button type="button" className="hod-decline" onClick={() => updateBooking(booking.id, 'Declined')}>Decline</button></div>}</article>)}</div>
      </section>}
      {section === 'schedules' && <section className="hod-panel">
        <div className="hod-panel-heading"><div><h2>Faculty schedules</h2><p>Coordinate department teaching and lab sessions.</p></div><span className="hod-count-tag">{schedules.length} scheduled</span></div>
        <form className="hod-schedule-form" onSubmit={addSchedule}><label>Faculty<input name="faculty" required placeholder="Faculty name" /></label><label>Course<input name="course" required placeholder="Course and code" /></label><label>Venue<input name="venue" required placeholder="Room or lab" /></label><label>Day<select name="day" defaultValue="Monday">{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => <option key={day}>{day}</option>)}</select></label><label>Time<input name="time" type="time" required /></label><button className="primary-button" type="submit">Add schedule</button></form>
        <div className="hod-schedule-list">{schedules.map((schedule) => <article className="hod-schedule-row" key={schedule.id}><span className="hod-schedule-day">{schedule.day}</span><div><strong>{schedule.course}</strong><small>{schedule.faculty} · {schedule.venue}</small></div><time>{schedule.time}</time><button type="button" className="hod-remove" aria-label={`Remove schedule for ${schedule.faculty}`} onClick={() => setSchedules((current) => current.filter((item) => item.id !== schedule.id))}>Remove</button></article>)}</div>
      </section>}
    </>
  )
}
