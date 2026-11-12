import { type FormEvent, useState } from 'react'
import './admin.css'

export type AdminSection = 'people' | 'facilities' | 'accounts'

type PeopleTab = 'Students' | 'Faculty' | 'Departments'
type CampusPerson = { id: string; name: string; email: string; department: string }
type Department = { id: string; name: string; head: string }
type Facility = { id: string; name: string; type: 'Classroom' | 'Lab' | 'Equipment'; department: string; capacity: number }
type Account = { id: string; name: string; email: string; role: 'Admin' | 'Faculty' | 'Student'; active: boolean; permissions: string[] }

const initialStudents: CampusPerson[] = [
  { id: 'ST-1042', name: 'Aarav Patel', email: 'aarav.patel@campus.edu', department: 'Computer Engineering' },
  { id: 'ST-1088', name: 'Maya Iyer', email: 'maya.iyer@campus.edu', department: 'Electronics' },
]
const initialFaculty: CampusPerson[] = [
  { id: 'FC-021', name: 'Dr. Anika Rao', email: 'anika.rao@campus.edu', department: 'Computer Engineering' },
  { id: 'FC-034', name: 'Prof. Daniel Kim', email: 'daniel.kim@campus.edu', department: 'Mechanical Engineering' },
]
const initialDepartments: Department[] = [
  { id: 'DEP-01', name: 'Computer Engineering', head: 'Dr. Anika Rao' },
  { id: 'DEP-02', name: 'Electronics', head: 'Prof. Mira Shah' },
  { id: 'DEP-03', name: 'Mechanical Engineering', head: 'Prof. Daniel Kim' },
]
const initialFacilities: Facility[] = [
  { id: 'FAC-101', name: 'Engineering Block A · Room 204', type: 'Classroom', department: 'Computer Engineering', capacity: 60 },
  { id: 'FAC-202', name: 'Embedded Systems Lab', type: 'Lab', department: 'Electronics', capacity: 32 },
  { id: 'EQ-018', name: 'Workstation pool · Lab 3', type: 'Equipment', department: 'Computer Engineering', capacity: 24 },
]
const initialAccounts: Account[] = [
  { id: 'AC-001', name: 'Campus Administrator', email: 'admin@campus.edu', role: 'Admin', active: true, permissions: ['Manage users', 'Manage facilities', 'View optimization'] },
  { id: 'AC-021', name: 'Dr. Anika Rao', email: 'anika.rao@campus.edu', role: 'Faculty', active: true, permissions: ['Manage learning materials'] },
  { id: 'AC-042', name: 'Aarav Patel', email: 'aarav.patel@campus.edu', role: 'Student', active: true, permissions: ['View learning materials'] },
]
const permissionOptions = ['Manage users', 'Manage facilities', 'Manage learning materials', 'View optimization', 'Manage academic records']
const departmentOptions = ['Computer Engineering', 'Electronics', 'Mechanical Engineering', 'Civil Engineering']

export default function AdminWorkspace({ section }: { section: AdminSection }) {
  const [peopleTab, setPeopleTab] = useState<PeopleTab>('Students')
  const [students, setStudents] = useState(initialStudents)
  const [faculty, setFaculty] = useState(initialFaculty)
  const [departments, setDepartments] = useState(initialDepartments)
  const [facilities, setFacilities] = useState(initialFacilities)
  const [accounts, setAccounts] = useState(initialAccounts)

  function addPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const name = String(values.get('name') ?? '').trim()
    const email = String(values.get('email') ?? '').trim()
    const department = String(values.get('department') ?? '')
    if (!name || !email) return
    const newPerson = { id: `NEW-${Date.now()}`, name, email, department }
    if (peopleTab === 'Students') setStudents((current) => [newPerson, ...current])
    else setFaculty((current) => [newPerson, ...current])
    form.reset()
  }

  function addDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const name = String(values.get('name') ?? '').trim()
    const head = String(values.get('head') ?? '').trim()
    if (!name) return
    setDepartments((current) => [{ id: `DEP-${Date.now()}`, name, head: head || 'Not assigned' }, ...current])
    form.reset()
  }

  function addFacility(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const name = String(values.get('name') ?? '').trim()
    if (!name) return
    setFacilities((current) => [{
      id: `FAC-${Date.now()}`,
      name,
      type: String(values.get('type')) as Facility['type'],
      department: String(values.get('department') ?? ''),
      capacity: Number(values.get('capacity')) || 1,
    }, ...current])
    form.reset()
  }

  function addAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const name = String(values.get('name') ?? '').trim()
    const email = String(values.get('email') ?? '').trim()
    if (!name || !email) return
    setAccounts((current) => [{
      id: `AC-${Date.now()}`,
      name,
      email,
      role: String(values.get('role')) as Account['role'],
      active: true,
      permissions: [],
    }, ...current])
    form.reset()
  }

  function togglePermission(accountId: string, permission: string) {
    setAccounts((current) => current.map((account) => account.id !== accountId ? account : {
      ...account,
      permissions: account.permissions.includes(permission)
        ? account.permissions.filter((item) => item !== permission)
        : [...account.permissions, permission],
    }))
  }

  const availableDepartments = [...new Set([...departments.map((department) => department.name), ...departmentOptions])]
  const title = section === 'people' ? 'People & departments' : section === 'facilities' ? 'Facilities & equipment' : 'Accounts & permissions'
  const description = section === 'people'
    ? 'Maintain student, faculty, and department records.'
    : section === 'facilities'
      ? 'Register classrooms, labs, and equipment for campus planning.'
      : 'Manage account access, roles, and permissions.'

  return (
    <>
      <section className="page-heading admin-heading">
        <div><p className="eyebrow">CAMPUS ADMINISTRATION</p><h1>{title}</h1><p className="subheading">{description}</p></div>
        <span className="admin-demo-tag">DEMO DATA · SESSION ONLY</span>
      </section>
      {section === 'people' && <>
        <div className="admin-tabs" role="tablist" aria-label="People management">
          {(['Students', 'Faculty', 'Departments'] as const).map((tab) => <button type="button" role="tab" aria-selected={peopleTab === tab} className={peopleTab === tab ? 'admin-tab active' : 'admin-tab'} key={tab} onClick={() => setPeopleTab(tab)}>{tab}</button>)}
        </div>
        {peopleTab === 'Departments' ? <>
          <form className="admin-form" onSubmit={addDepartment}><label>Department name<input name="name" required placeholder="e.g. Civil Engineering" /></label><label>Department head<input name="head" placeholder="Faculty name" /></label><button className="primary-button" type="submit">Add department</button></form>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Department</th><th>Head</th><th>Code</th><th /></tr></thead><tbody>{departments.map((department) => <tr key={department.id}><td><strong>{department.name}</strong></td><td>{department.head}</td><td>{department.id}</td><td><button className="admin-remove" type="button" aria-label={`Remove ${department.name}`} onClick={() => setDepartments((current) => current.filter((item) => item.id !== department.id))}>Remove</button></td></tr>)}</tbody></table></div>
        </> : <>
          <form className="admin-form" onSubmit={addPerson}><label>Full name<input name="name" required placeholder="Full name" /></label><label>Institutional email<input name="email" type="email" required placeholder="name@campus.edu" /></label><label>Department<select name="department" defaultValue={availableDepartments[0]}>{availableDepartments.map((department) => <option key={department}>{department}</option>)}</select></label><button className="primary-button" type="submit">Add {peopleTab === 'Students' ? 'student' : 'faculty'}</button></form>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Department</th><th>ID</th><th /></tr></thead><tbody>{(peopleTab === 'Students' ? students : faculty).map((person) => <tr key={person.id}><td><strong>{person.name}</strong></td><td>{person.email}</td><td>{person.department}</td><td>{person.id}</td><td><button className="admin-remove" type="button" aria-label={`Remove ${person.name}`} onClick={() => peopleTab === 'Students' ? setStudents((current) => current.filter((item) => item.id !== person.id)) : setFaculty((current) => current.filter((item) => item.id !== person.id))}>Remove</button></td></tr>)}</tbody></table></div>
        </>}
      </>}
      {section === 'facilities' && <>
        <form className="admin-form" onSubmit={addFacility}><label>Resource name<input name="name" required placeholder="Classroom, lab, or equipment" /></label><label>Type<select name="type" defaultValue="Classroom"><option>Classroom</option><option>Lab</option><option>Equipment</option></select></label><label>Department<select name="department" defaultValue={availableDepartments[0]}>{availableDepartments.map((department) => <option key={department}>{department}</option>)}</select></label><label>Capacity / units<input name="capacity" type="number" min="1" defaultValue="30" /></label><button className="primary-button" type="submit">Add resource</button></form>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Resource</th><th>Type</th><th>Department</th><th>Capacity / units</th><th /></tr></thead><tbody>{facilities.map((facility) => <tr key={facility.id}><td><strong>{facility.name}</strong></td><td><span className="admin-type-tag">{facility.type}</span></td><td>{facility.department}</td><td>{facility.capacity}</td><td><button className="admin-remove" type="button" aria-label={`Remove ${facility.name}`} onClick={() => setFacilities((current) => current.filter((item) => item.id !== facility.id))}>Remove</button></td></tr>)}</tbody></table></div>
      </>}
      {section === 'accounts' && <>
        <form className="admin-form" onSubmit={addAccount}><label>Full name<input name="name" required placeholder="Full name" /></label><label>Email<input name="email" type="email" required placeholder="name@campus.edu" /></label><label>Role<select name="role" defaultValue="Student"><option>Student</option><option>Faculty</option><option>Admin</option></select></label><button className="primary-button" type="submit">Create account</button></form>
        <div className="admin-account-list">{accounts.map((account) => <article className="admin-account" key={account.id}><div className="admin-account-head"><div><strong>{account.name}</strong><span>{account.email} · {account.id}</span></div><label className="admin-toggle"><input type="checkbox" checked={account.active} onChange={() => setAccounts((current) => current.map((item) => item.id === account.id ? { ...item, active: !item.active } : item))} /><span>{account.active ? 'Active' : 'Suspended'}</span></label></div><div className="admin-account-controls"><label className="admin-role-select">Role<select value={account.role} onChange={(event) => setAccounts((current) => current.map((item) => item.id === account.id ? { ...item, role: event.target.value as Account['role'] } : item))}><option>Student</option><option>Faculty</option><option>Admin</option></select></label><fieldset className="admin-permissions"><legend>Permissions</legend>{permissionOptions.map((permission) => <label key={permission}><input type="checkbox" checked={account.permissions.includes(permission)} onChange={() => togglePermission(account.id, permission)} />{permission}</label>)}</fieldset></div></article>)}</div>
      </>}
    </>
  )
}
