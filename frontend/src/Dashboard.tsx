import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react'
import { examDates, semesterRecords } from './academicData'
import AdminWorkspace, { type AdminSection } from './AdminWorkspace'
import AnimatedContent from './AnimatedContent'
import HodWorkspace from './HodWorkspace'
import './dashboard.css'

type UserRole = 'student' | 'staff' | 'hod' | 'admin'
type MaterialCategory = 'Notes / Study Materials' | 'Educational Videos' | 'Previous Year Question Papers' | 'E-Books' | 'Lab Materials' | 'Faculty Materials' | 'Assignments'

type Material = {
  id: string
  title: string
  category: MaterialCategory
  course: string
  format: string
  updated: string
  description: string
  author: string
  link?: string
}

const categories: { name: MaterialCategory; icon: string; tone: string }[] = [
  { name: 'Notes / Study Materials', icon: 'N', tone: 'mint' },
  { name: 'Educational Videos', icon: 'V', tone: 'blue' },
  { name: 'Previous Year Question Papers', icon: 'Q', tone: 'coral' },
  { name: 'E-Books', icon: 'B', tone: 'gold' },
  { name: 'Lab Materials', icon: 'L', tone: 'violet' },
  { name: 'Faculty Materials', icon: 'F', tone: 'teal' },
  { name: 'Assignments', icon: 'A', tone: 'rose' },
]

const initialMaterials: Material[] = [
  { id: 'MAT-01', title: 'Cell Biology: exam revision notes', category: 'Notes / Study Materials', course: 'BIO 204 · Cell Biology', format: 'PDF · 24 pages', updated: 'Oct 6, 2026', description: 'A structured review of cell membranes, organelles, energy transfer, and gene expression, prepared for midterm revision.', author: 'Dr. Amara Chen' },
  { id: 'MAT-02', title: 'Organic chemistry: reaction pathways', category: 'Educational Videos', course: 'CHEM 221 · Organic Chemistry', format: 'Video · 38 min', updated: 'Oct 4, 2026', description: 'A guided walkthrough of common reaction mechanisms with worked examples and practice pauses.', author: 'Learning Support' },
  { id: 'MAT-03', title: 'Calculus II final examination', category: 'Previous Year Question Papers', course: 'MATH 202 · Calculus II', format: 'PDF · 2025', updated: 'Sep 29, 2026', description: 'Previous examination paper covering integration techniques, sequences, series, and parametric curves.', author: 'Mathematics Department' },
  { id: 'MAT-04', title: 'Research methods in education', category: 'E-Books', course: 'EDU 310 · Research Methods', format: 'EPUB · 12 MB', updated: 'Sep 26, 2026', description: 'An accessible introduction to research design, sampling, measurement, and ethical review.', author: 'University Library' },
  { id: 'MAT-05', title: 'Physics laboratory handbook', category: 'Lab Materials', course: 'PHYS 115 · General Physics', format: 'PDF · 42 pages', updated: 'Sep 22, 2026', description: 'Safety notes, equipment guides, experimental procedures, and report templates for the introductory physics lab.', author: 'Physics Lab Team' },
  { id: 'MAT-06', title: 'Data structures: lecture slides', category: 'Faculty Materials', course: 'CS 240 · Data Structures', format: 'PDF · 68 slides', updated: 'Sep 20, 2026', description: 'Faculty lecture deck covering trees, graphs, hash tables, and algorithmic complexity.', author: 'Prof. Elliot Morgan' },
  { id: 'MAT-07', title: 'Statistics problem set 04', category: 'Assignments', course: 'STAT 210 · Applied Statistics', format: 'PDF · Due Oct 20', updated: 'Oct 7, 2026', description: 'Practice problems on confidence intervals, hypothesis testing, and interpreting statistical results.', author: 'Dr. Nia Okafor' },
]

type Resource = {
  name: string
  category: string
  available: number
  total: number
  unit: string
  tone: string
}

type Request = {
  id: string
  title: string
  department: string
  category: string
  units: number
  urgency: number
  students: number
}

const resources: Resource[] = [
  { name: 'Science labs', category: 'Lab access', available: 18, total: 24, unit: 'sessions', tone: 'mint' },
  { name: 'Study rooms', category: 'Study spaces', available: 9, total: 16, unit: 'rooms', tone: 'blue' },
  { name: 'Loaner laptops', category: 'Technology', available: 31, total: 40, unit: 'devices', tone: 'coral' },
  { name: 'Tutoring hours', category: 'Academic support', available: 12, total: 20, unit: 'hours', tone: 'gold' },
]

const requests: Request[] = [
  { id: 'REQ-204', title: 'Intro biology lab access', department: 'Life sciences', category: 'Lab access', units: 8, urgency: 5, students: 46 },
  { id: 'REQ-203', title: 'Evening study spaces', department: 'Student services', category: 'Study spaces', units: 6, urgency: 4, students: 32 },
  { id: 'REQ-202', title: 'Laptop lending pool', department: 'Digital learning', category: 'Technology', units: 12, urgency: 4, students: 58 },
]

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function Dashboard() {
  const [role, setRole] = useState<UserRole>('student')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeView, setActiveView] = useState<'overview' | 'library' | 'academics' | 'admin' | 'hod'>('academics')
  const [adminSection, setAdminSection] = useState<AdminSection>('people')
  const [academicTab, setAcademicTab] = useState<'results' | 'attendance' | 'papers' | 'hall-ticket'>('results')
  const [selectedSemester, setSelectedSemester] = useState(1)
  const [materials, setMaterials] = useState(initialMaterials)
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'All resources'>('All resources')
  const [search, setSearch] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [showUploadAssignment, setShowUploadAssignment] = useState(false)
  const [showProfileCard, setShowProfileCard] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [savedMaterials, setSavedMaterials] = useState<string[]>([])
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null)
  const [uploadedAssignment, setUploadedAssignment] = useState<File | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [notice, setNotice] = useState('')
  const [allocationCount, setAllocationCount] = useState(12)
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()
  const email = role === 'student' ? registrationNumber.trim() : loginEmail
  const setEmail = setLoginEmail
  const accountIdentifier = role === 'student' ? registrationNumber.trim() : email.split('@')[0]
  const profileName = role === 'student' ? (registrationNumber.trim() || 'Student profile') : (email.split('@')[0] || 'Campus user')
  const departmentOptions = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Artificial Intelligence & Data Science',
    'Biotechnology',
    'Chemical Engineering',
    'Mathematics',
    'Physics',
    'Humanities & Sciences',
  ]
  const advisorOptions = [
    'Dr. Meera Iyer',
    'Dr. Anika Rao',
    'Prof. Dev Mehta',
    'Dr. Nisha Kulkarni',
    'Dr. Rohan Sethi',
    'Prof. Leena Nair',
    'Dr. Karthik Menon',
    'Prof. Aditi Sharma',
  ]
  const [profileDetails, setProfileDetails] = useState({
    fullName: 'Aarav Nair',
    registerNumber: registrationNumber.trim() || '24CSE1042',
    dateOfBirth: dateOfBirth || '2006-04-12',
    department: 'Computer Science & Engineering',
    programType: 'B.E.',
    program: 'Computer Engineering',
    semester: `Semester ${selectedSemester}`,
    email: role === 'student' ? 'student@campusflow.edu' : email || 'user@campusflow.edu',
    phone: '+91 98765 43210',
    advisor: 'Dr. Meera Iyer',
    status: 'Active',
  })
  const studentProfileDetails = profileDetails
  const currentSemester = semesterRecords[selectedSemester - 1]
  const averageAttendance = Math.round(currentSemester.subjects.reduce((total, subject) => total + subject.attendance, 0) / currentSemester.subjects.length)

  const visibleMaterials = useMemo(() => materials.filter((material) => {
    const query = search.trim().toLowerCase()
    const matchesCategory = query !== '' || selectedCategory === 'All resources' || material.category === selectedCategory
    const matchesSearch = !query || `${material.id} ${material.title} ${material.course} ${material.author} ${material.category} ${material.format} ${material.description}`.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  }), [materials, search, selectedCategory])

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (role === 'student' ? !registrationNumber.trim() || !dateOfBirth : !email.includes('@') || password.length < 8) {
      setLoginError(role === 'student' ? 'Enter your register number and date of birth.' : 'Enter a valid email and a password with at least 8 characters.')
      return
    }
    setLoginError('')
    setActiveView(role === 'student' ? 'academics' : role === 'hod' ? 'hod' : 'overview')
    setIsSignedIn(true)
  }

  function handleProfileFieldChange(field: keyof typeof profileDetails, value: string) {
    setProfileDetails((current) => ({ ...current, [field]: value }))
  }

  function handlePdfUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setUploadedPdf(null)
      return
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadedPdf(null)
      return
    }
    setUploadedPdf(file)
  }

  function handleAssignmentUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setUploadedAssignment(null)
      return
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadedAssignment(null)
      return
    }
    setUploadedAssignment(file)
  }

  async function addMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') ?? '').trim()
    if (!title) return

    const linkValue = String(formData.get('link') || '').trim()
    let link = ''
    if (linkValue) {
      try {
        const parsedLink = new URL(linkValue)
        if (!['http:', 'https:'].includes(parsedLink.protocol)) return
        link = parsedLink.toString()
      } catch {
        return
      }
    }

    if (!link && uploadedPdf) {
      link = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ''))
        reader.onerror = () => reject(new Error('Unable to read uploaded file'))
        reader.readAsDataURL(uploadedPdf)
      })
    }

    const savedFormat = String(formData.get('format') || '').trim()
    const fileSizeLabel = uploadedPdf ? `${Math.max(1, Math.round(uploadedPdf.size / 1024))} KB PDF` : 'Resource'

    setMaterials((current) => [{
      id: `MAT-${Date.now()}`,
      title,
      category: String(formData.get('category')) as MaterialCategory,
      course: String(formData.get('course') || 'General resource'),
      format: savedFormat || fileSizeLabel,
      updated: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
      description: String(formData.get('description') || 'No description added.'),
      author: accountIdentifier,
      link: link || undefined,
    }, ...current])
    setShowAddMaterial(false)
    setSelectedCategory('All resources')
    setSearch('')
    setUploadedPdf(null)
    event.currentTarget.reset()
  }

  async function addStudentAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('assignment-title') ?? '').trim()
    if (!title) return

    let link = ''
    if (uploadedAssignment) {
      link = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ''))
        reader.onerror = () => reject(new Error('Unable to read assignment file'))
        reader.readAsDataURL(uploadedAssignment)
      })
    }

    const course = String(formData.get('assignment-course') || 'General assignment')
    const description = String(formData.get('assignment-description') || 'Student submitted assignment.')

    setMaterials((current) => [{
      id: `MAT-${Date.now()}`,
      title,
      category: 'Assignments',
      course,
      format: uploadedAssignment ? `${Math.max(1, Math.round(uploadedAssignment.size / 1024))} KB PDF` : 'PDF · student submission',
      updated: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
      description,
      author: accountIdentifier,
      link: link || undefined,
    }, ...current])

    setShowUploadAssignment(false)
    setUploadedAssignment(null)
    event.currentTarget.reset()
  }

  async function downloadMaterial(material: Material) {
    if (material.link && !material.link.startsWith('data:')) {
      window.open(material.link, '_blank', 'noopener,noreferrer')
      return
    }

    if (material.link) {
      const downloadLink = document.createElement('a')
      downloadLink.href = material.link
      downloadLink.download = `${material.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      return
    }

    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF()
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.text(pdf.splitTextToSize(material.title, 174), 18, 24)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.text(`Course: ${material.course}`, 18, 43)
    pdf.text(`Category: ${material.category}`, 18, 51)
    pdf.text(`Provided by: ${material.author}`, 18, 59)
    pdf.text(`Format: ${material.format}`, 18, 67)
    pdf.text(pdf.splitTextToSize(material.description, 174), 18, 82)
    pdf.setFontSize(9)
    pdf.text('DEMO SUMMARY - The original resource file is not attached.', 18, 275)
    pdf.save(`${material.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`)
  }

  async function downloadHallTicket() {
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF()
    const left = 18
    const studentName = accountIdentifier.replace(/[._-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    pdf.setFillColor(49, 95, 66)
    pdf.rect(0, 0, 210, 37, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(17)
    pdf.text('CAMPUSFLOW ENGINEERING', left, 16)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.text(`END-SEMESTER EXAMINATION 2026  |  SEMESTER ${selectedSemester}`, left, 26)
    pdf.setTextColor(35, 52, 42)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(15)
    pdf.text('EXAMINATION HALL TICKET', left, 52)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.text(`Student: ${studentName}`, left, 65)
    pdf.text(`Registration ID: ${accountIdentifier.toUpperCase()}`, left, 73)
    pdf.text(`Program: B.E. Computer Engineering  |  Academic year: 2026–27`, left, 81)
    pdf.text('Examination schedule', left, 96)

    let y = 106
    pdf.setFillColor(235, 242, 236)
    pdf.rect(left, y - 6, 174, 10, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.text('PAPER', left + 2, y)
    pdf.text('DATE', 143, y)
    pdf.text('TIME', 173, y)
    y += 12
    pdf.setFont('helvetica', 'normal')
    currentSemester.subjects.forEach((subject, index) => {
      const name = pdf.splitTextToSize(`${subject.code}  ${subject.name}`, 112)
      pdf.text(name, left + 2, y)
      pdf.text(new Date(`${examDates[index % examDates.length]}T00:00:00`).toLocaleDateString('en-GB'), 143, y)
      pdf.text('9:30 AM', 173, y)
      y += Math.max(9, name.length * 5) + 5
    })

    pdf.setDrawColor(215, 225, 216)
    pdf.line(left, y + 2, 192, y + 2)
    pdf.setFontSize(9)
    pdf.text('Bring your institutional photo ID. Arrive at the examination hall 30 minutes early.', left, y + 11)
    pdf.setTextColor(166, 102, 79)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DEMO DOCUMENT — NOT VALID FOR EXAM ENTRY', left, y + 20)
    pdf.save(`campusflow-semester-${selectedSemester}-hall-ticket-demo.pdf`)
  }

  async function runOptimization() {
    setIsRunning(true)
    setNotice('')
    try {
      const response = await fetch(`${apiUrl}/api/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resources: resources.map(({ name, category, available }) => ({ name, category, available_units: available })),
          requests: requests.map(({ id, title, department, category, units, urgency, students }) => ({
            id,
            title,
            department,
            category,
            requested_units: units,
            urgency,
            students_affected: students,
          })),
        }),
      })
      if (!response.ok) throw new Error('Optimization failed')
      const result: { allocations: unknown[] } = await response.json()
      setAllocationCount(result.allocations.length)
      setNotice(`Optimization complete. ${result.allocations.length} allocations were recommended.`)
    } catch {
      setNotice('Could not reach the API. Start the backend at localhost:8000 and try again.')
    } finally {
      setIsRunning(false)
    }
  }

  if (!isSignedIn) {
    return (
      <main className="login-screen">
        <AnimatedContent className="login-aside" trigger="mount" direction="horizontal" reverse duration={0.9} ease="power3.out" stagger={0.12}>
          <a className="brand login-brand" href="#login"><span className="brand-mark">C</span><span>campus<span className="brand-light">flow</span></span></a>
          <div className="login-story"><span className="banner-kicker">ACADEMIC RESOURCE PLANNING</span><h1>Everything your campus needs to thrive.</h1><p>Bring learning materials, campus resources, and student support into one clear workspace.</p><div className="login-stats"><span><strong>7</strong> learning libraries</span><span><strong>1</strong> connected campus</span></div></div>
          <span className="login-footnote">CAMPUSFLOW <i>·</i> ACADEMIC YEAR 2026–27</span>
        </AnimatedContent>
        <AnimatedContent className="login-main" trigger="mount" direction="horizontal" duration={0.9} delay={0.12} ease="power3.out">
          <form className="login-form" onSubmit={signIn}><span className="eyebrow">WELCOME TO CAMPUSFLOW</span><h2>Sign in to your workspace</h2><p className="login-description">Choose your campus role to continue.</p><div className="role-picker" aria-label="Account type">{([['student', 'Student'], ['staff', 'Staff'], ['hod', 'HOD / Department'], ['admin', 'Admin']] as const).map(([value, label]) => <button className={role === value ? 'role-option selected' : 'role-option'} type="button" key={value} onClick={() => setRole(value)} aria-pressed={role === value}>{label}</button>)}</div>{role === 'student' ? <><label className="field-label" htmlFor="login-registration">Register number</label><input id="login-registration" type="text" autoComplete="username" placeholder="e.g. 24CSE1042" value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} required /><label className="field-label" htmlFor="login-date-of-birth">Date of birth</label><input id="login-date-of-birth" type="date" autoComplete="bday" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} required /></> : <><label className="field-label" htmlFor="login-email">Institutional email</label><input id="login-email" type="email" autoComplete="username" placeholder="you@university.edu" value={email} onChange={(event) => setEmail(event.target.value)} required /><label className="field-label" htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete="current-password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></>}{loginError && <p className="login-error" role="alert">{loginError}</p>}<button className="primary-button login-submit" type="submit">Continue as {role === 'hod' ? 'HOD / Department' : role[0].toUpperCase() + role.slice(1)} <span>→</span></button><p className="prototype-note">Prototype sign-in: student details are not verified against institutional records.</p></form>
        </AnimatedContent>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="CampusFlow home"><span className="brand-mark">C</span><span>campus<span className="brand-light">flow</span></span></a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {role === 'student' && <button className={activeView === 'academics' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => setActiveView('academics')}><span className="nav-icon">S</span>Student hub</button>}
          {role === 'student' && <button className="nav-link" type="button" onClick={() => setShowUploadAssignment(true)}><span className="nav-icon">↑</span>Upload assignment</button>}
          {role === 'hod' && <button className={activeView === 'hod' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => setActiveView('hod')}><span className="nav-icon">H</span>Department workspace</button>}
          {role !== 'hod' && <button className={activeView === 'overview' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => setActiveView('overview')}><span className="nav-icon">O</span>{role === 'admin' ? 'AI optimization' : 'Overview'}</button>}
          {role === 'admin' && <button className={activeView === 'admin' && adminSection === 'people' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => { setAdminSection('people'); setActiveView('admin') }}><span className="nav-icon">P</span>People & departments</button>}
          {role === 'admin' && <button className={activeView === 'admin' && adminSection === 'facilities' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => { setAdminSection('facilities'); setActiveView('admin') }}><span className="nav-icon">F</span>Facilities & equipment</button>}
          {role === 'admin' && <button className={activeView === 'admin' && adminSection === 'accounts' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => { setAdminSection('accounts'); setActiveView('admin') }}><span className="nav-icon">A</span>Accounts & permissions</button>}
          {role !== 'admin' && <button className={activeView === 'library' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => setActiveView('library')}><span className="nav-icon">L</span>Learning library</button>}
          {role !== 'student' && <a className="nav-link" href="#requests"><span className="nav-icon">Q</span>Requests<span className="nav-count">3</span></a>}
          {role !== 'student' && <a className="nav-link" href="#insights"><span className="nav-icon">I</span>Insights</a>}
        </nav>
        <div className="sidebar-bottom">
          <div className="term-card"><span className="term-dot" />Fall semester 2026<span>⌄</span></div>
          <div className="profile"><div className="avatar">{accountIdentifier.slice(0, 2).toUpperCase()}</div><div><strong>{accountIdentifier}</strong><small>{role === 'admin' ? 'Campus administrator' : role === 'hod' ? 'HOD / Department' : role === 'staff' ? 'Faculty staff' : 'Student account'}</small></div><button className="signout-button" type="button" onClick={() => { setIsSignedIn(false); setPassword('') }}>Sign out</button></div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{activeView === 'academics' ? 'Student hub' : activeView === 'library' ? 'Learning library' : activeView === 'admin' ? 'Administration' : activeView === 'hod' ? 'Department workspace' : role === 'admin' ? 'AI optimization' : 'Overview'}</strong></div><div className="topbar-right"><span className="role-pill">{role === 'hod' ? 'HOD / Department' : role[0].toUpperCase() + role.slice(1)}</span><div className="profile-menu-wrap"><button className="profile-trigger" type="button" onClick={() => setShowProfileCard((current) => !current)} aria-expanded={showProfileCard} aria-label="Open student profile"><span className="profile-avatar-mini">{profileName.slice(0, 2).toUpperCase()}</span><span className="profile-trigger-text">{profileName}</span><span className="profile-caret">▾</span></button>{showProfileCard && <div className="profile-card" role="dialog" aria-modal="false"><div className="profile-card-header"><div className="profile-avatar-large">{profileName.slice(0, 2).toUpperCase()}</div><div><p className="profile-card-title">{studentProfileDetails.fullName}</p><p className="profile-card-role">{role === 'admin' ? 'Campus administrator' : role === 'hod' ? 'Department head' : role === 'staff' ? 'Faculty member' : 'Student profile'}</p></div></div>{isEditingProfile ? <div className="profile-edit-form"><label><span>Full name</span><input value={profileDetails.fullName} onChange={(event) => handleProfileFieldChange('fullName', event.target.value)} /></label><label><span>Register no.</span><input value={profileDetails.registerNumber} onChange={(event) => handleProfileFieldChange('registerNumber', event.target.value)} /></label><label><span>Date of birth</span><input type="date" value={profileDetails.dateOfBirth} onChange={(event) => handleProfileFieldChange('dateOfBirth', event.target.value)} /></label><label><span>Department</span><select value={profileDetails.department} onChange={(event) => handleProfileFieldChange('department', event.target.value)}>{departmentOptions.map((option) => <option value={option} key={option}>{option}</option>)}</select></label><label><span>Program type</span><select value={profileDetails.programType} onChange={(event) => handleProfileFieldChange('programType', event.target.value)}><option value="B.E.">B.E.</option><option value="B.Tech.">B.Tech.</option></select></label><label><span>Program</span><input value={profileDetails.program} onChange={(event) => handleProfileFieldChange('program', event.target.value)} /></label><label><span>Email</span><input type="email" value={profileDetails.email} onChange={(event) => handleProfileFieldChange('email', event.target.value)} /></label><label><span>Phone</span><input value={profileDetails.phone} onChange={(event) => handleProfileFieldChange('phone', event.target.value)} /></label><label><span>Advisor</span><select value={profileDetails.advisor} onChange={(event) => handleProfileFieldChange('advisor', event.target.value)}>{advisorOptions.map((option) => <option value={option} key={option}>{option}</option>)}</select></label><div className="profile-edit-actions"><button type="button" className="primary-button" onClick={() => { setProfileDetails((current) => ({ ...current, semester: `Semester ${selectedSemester}` })); setIsEditingProfile(false) }}>Save</button><button type="button" className="text-button profile-close" onClick={() => setIsEditingProfile(false)}>Cancel</button></div></div> : <><div className="profile-card-grid"><div><span>Register no.</span><strong>{studentProfileDetails.registerNumber}</strong></div><div><span>Date of birth</span><strong>{new Date(studentProfileDetails.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div><div><span>Department</span><strong>{studentProfileDetails.department}</strong></div><div><span>Program</span><strong>{studentProfileDetails.programType} {studentProfileDetails.program}</strong></div><div><span>Semester</span><strong>{studentProfileDetails.semester}</strong></div><div><span>Advisor</span><strong>{studentProfileDetails.advisor}</strong></div><div><span>Email</span><strong>{studentProfileDetails.email}</strong></div><div><span>Phone</span><strong>{studentProfileDetails.phone}</strong></div><div><span>Advisor</span><strong>{studentProfileDetails.advisor}</strong></div></div><div className="profile-card-footer"><span className="status-badge">{studentProfileDetails.status}</span><div className="profile-actions"><button type="button" className="text-button profile-close" onClick={() => setIsEditingProfile(true)}>Edit</button><button type="button" className="text-button profile-close" onClick={() => setShowProfileCard(false)}>Close</button></div></div></> }</div>}</div><span className="sync-status"><span /> Data synced 8 min ago</span><button className="icon-button" aria-label="Notifications">♧<i /></button></div></header>
        <div className="page-wrap">
          {activeView === 'admin' ? <AdminWorkspace section={adminSection} /> : activeView === 'hod' ? <HodWorkspace /> : activeView === 'academics' ? <>
            <section className="page-heading"><div><p className="eyebrow">ENGINEERING ACADEMIC RECORD</p><h1>Student hub</h1><p className="subheading">Semester results, attendance, exam papers, and hall tickets.</p></div><div className="student-heading-actions"><button className="primary-button" type="button" onClick={() => setShowUploadAssignment(true)}><span>＋</span>Upload assignment</button><span className="demo-badge">SAMPLE ACADEMIC DATA</span></div></section>
            <section className="semester-picker" aria-label="Select semester">{semesterRecords.map((record) => <button className={selectedSemester === record.semester ? 'semester-button selected' : 'semester-button'} type="button" key={record.semester} onClick={() => setSelectedSemester(record.semester)}>Sem {record.semester}</button>)}</section>
            <section className="academic-summary"><article><span>SEMESTER</span><strong>{selectedSemester} <small>of 8</small></strong></article><article><span>RESULT STATUS</span><strong className={currentSemester.result === 'Passed' ? 'status-passed' : 'status-progress'}>{currentSemester.result}</strong></article><article><span>SEMESTER GPA</span><strong>{currentSemester.gpa}<small> / 10</small></strong></article><article><span>ATTENDANCE</span><strong className={averageAttendance < 75 ? 'status-low' : 'status-passed'}>{averageAttendance}<small>% average</small></strong></article></section>
            <div className="academic-grid" aria-label="Academic information">{([['results', 'Semester results', 'Marks and grade status'], ['attendance', 'Attendance', 'Subject-wise attendance'], ['papers', 'Question papers', 'Previous exam papers'], ['hall-ticket', 'Hall ticket', 'Download exam pass']] as const).map(([tab, label, info]) => <button className={academicTab === tab ? 'academic-card active' : 'academic-card'} key={tab} type="button" onClick={() => setAcademicTab(tab)}><span className="academic-card-label">{label}</span><strong>{info}</strong></button>)}</div>
            {academicTab === 'hall-ticket' ? <section className="academic-panel hall-ticket-panel"><div className="hall-ticket-heading"><div><p className="eyebrow">EXAM DOCUMENT</p><h2>Semester {selectedSemester} hall ticket</h2><p>Examination schedule for the selected semester.</p></div><span className="ticket-stamp">DEMO</span></div><div className="hall-student-grid"><div><span>STUDENT</span><strong>{email.split('@')[0].replace(/[._-]/g, ' ')}</strong></div><div><span>REGISTRATION ID</span><strong>DEMO-{email.split('@')[0].toUpperCase()}</strong></div><div><span>PROGRAM</span><strong>B.E. Computer Engineering</strong></div><div><span>ACADEMIC YEAR</span><strong>2026–27</strong></div></div><div className="schedule-table"><div className="schedule-row schedule-head"><span>Paper</span><span>Examination date</span><span>Session</span></div>{currentSemester.subjects.map((subject, index) => <div className="schedule-row" key={subject.code}><span><strong>{subject.code}</strong>{subject.name}</span><span>{new Date(`${examDates[index % examDates.length]}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span><span>9:30 AM</span></div>)}</div><p className="demo-warning">This is a sample hall ticket, not valid for exam entry. Official schedules and candidate details must come from your institution.</p><button className="primary-button" onClick={() => void downloadHallTicket()}><span>↓</span>Download hall ticket PDF</button></section> : academicTab === 'papers' ? <section className="academic-panel"><div className="panel-heading"><div><h2>Semester {selectedSemester} question papers</h2><p>Archive index for all papers in this semester.</p></div><span className="queue-badge">{currentSemester.subjects.length} papers</span></div><div className="paper-list">{currentSemester.subjects.map((subject) => <article className="paper-row" key={subject.code}><span className="paper-icon">P</span><div className="paper-details"><strong>{subject.name}</strong><span>{subject.code} · {subject.credits} credits · Written examination</span></div><span className="paper-state">PDF not uploaded</span></article>)}</div><p className="demo-warning">Paper PDFs were not provided. These entries are the semester paper index; replace them with institution-approved past papers before publishing downloads.</p></section> : <section className="academic-panel"><div className="panel-heading"><div><h2>{academicTab === 'results' ? `Semester ${selectedSemester} results` : `Semester ${selectedSemester} attendance`}</h2><p>{academicTab === 'results' ? 'Paper-wise marks and result status.' : 'Subject-wise attendance recorded this semester.'}</p></div><span className="queue-badge">{currentSemester.subjects.length} papers</span></div><div className="academic-table-wrap"><table className="academic-table"><thead><tr><th>Paper</th><th>Credits</th>{academicTab === 'results' ? <><th>Marks / 100</th><th>Grade</th><th>Result</th></> : <><th>Present</th><th>Conducted</th><th>Attendance</th></>}</tr></thead><tbody>{currentSemester.subjects.map((subject, index) => { const grade = subject.marks >= 90 ? 'A+' : subject.marks >= 80 ? 'A' : subject.marks >= 70 ? 'B' : 'C'; const conducted = 24 + index * 2; const present = Math.round(subject.attendance * conducted / 100); const actualAttendance = Math.round(present / conducted * 100); return <tr key={subject.code}><td><strong>{subject.name}</strong><small>{subject.code}</small></td><td>{subject.credits}</td>{academicTab === 'results' ? <><td>{currentSemester.result === 'Passed' ? subject.marks : '—'}</td><td>{currentSemester.result === 'Passed' ? grade : '—'}</td><td><span className={currentSemester.result === 'Passed' ? 'result-pill passed' : 'result-pill pending'}>{currentSemester.result}</span></td></> : <><td>{present}</td><td>{conducted}</td><td><span className={actualAttendance < 75 ? 'attendance-value low' : 'attendance-value'}>{actualAttendance}%</span></td></>}</tr>})}</tbody></table></div><p className="demo-warning">Sample records for interface preview only. Confirm results and attendance against the official student information system.</p></section>}
          </> : activeView === 'library' ? <>
            <section className="page-heading library-heading"><div><p className="eyebrow">CAMPUS KNOWLEDGE HUB</p><h1>Learning library</h1><p className="subheading">Course materials, practical resources, and faculty knowledge in one place.</p></div>{role === 'student' ? <button className="primary-button" onClick={() => setShowUploadAssignment(true)}><span>＋</span>Upload assignment</button> : <button className="primary-button" onClick={() => setShowAddMaterial(true)}><span>＋</span>Add material</button>}</section>
            <section className="library-tools"><label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search all learning materials" placeholder="Search all categories…" value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>/</kbd></label><span className="result-count">{visibleMaterials.length} {search.trim() ? 'results across all categories' : 'materials'}</span></section>
            <div className="library-layout"><aside className="category-panel"><p className="category-label">LIBRARY CATEGORIES</p><button className={selectedCategory === 'All resources' ? 'category-option active' : 'category-option'} onClick={() => setSelectedCategory('All resources')}><span className="category-icon all">A</span>All resources<span className="category-count">{materials.length}</span></button>{categories.map((category) => <button className={selectedCategory === category.name ? 'category-option active' : 'category-option'} key={category.name} onClick={() => setSelectedCategory(category.name)}><span className={`category-icon ${category.tone}`}>{category.icon}</span><span className="category-name">{category.name}</span><span className="category-count">{materials.filter((material) => material.category === category.name).length}</span></button>)}</aside>
              <section className="material-results" aria-live="polite"><div className="results-heading"><h2>{search.trim() ? 'Search results across all categories' : selectedCategory}</h2><span>Newest first</span></div>{visibleMaterials.length ? <div className="material-grid">{visibleMaterials.map((material) => { const category = categories.find((item) => item.name === material.category)!; return <article className="material-card" key={material.id}><div className="material-card-top"><span className={`category-icon ${category.tone}`}>{category.icon}</span><span className="material-format">{material.format}</span></div><p className="material-category">{material.category}</p><h3>{material.title}</h3><p className="material-course">{material.course}</p><div className="material-meta"><span>{material.author}</span><span>{material.updated}</span></div><div className="material-actions"><button className="material-open" onClick={() => setSelectedMaterial(material)}>View details <span>→</span></button>{role === 'student' && <button className="material-download" onClick={() => void downloadMaterial(material)}>{material.link && !material.link.startsWith('data:') ? 'Open resource' : 'Download PDF'} <span>↓</span></button>}</div></article>})}</div> : <div className="empty-state"><span>⌕</span><h3>No materials found</h3><p>Try a different title, course, faculty member, or category.</p></div>}</section>
            </div>
          </> : <>
          <section className="page-heading"><div><p className="eyebrow">{today}</p><h1>Resource overview</h1><p className="subheading">A clearer view of what your campus needs, and where it can go further.</p></div><button className="primary-button" onClick={runOptimization} disabled={isRunning}><span className="spark">✳</span>{isRunning ? 'Optimizing…' : 'Run optimization'}</button></section>
          {notice && <p className="notice" role="status">{notice}</p>}

          <section className="metric-grid" aria-label="Semester metrics">
            <article className="metric-card"><div className="metric-top"><span>Resource utilization</span><span className="metric-symbol green">↗</span></div><div className="metric-value">78<span>%</span></div><div className="metric-foot"><span className="trend-up">+6.4%</span> <span>vs. last month</span></div><div className="mini-bars" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div></article>
            <article className="metric-card"><div className="metric-top"><span>Students supported</span><span className="metric-symbol blue">↗</span></div><div className="metric-value">2,840</div><div className="metric-foot"><span className="trend-up">+12.8%</span> <span>vs. last month</span></div><div className="metric-line" aria-hidden="true"><i /></div></article>
            <article className="metric-card"><div className="metric-top"><span>Pending requests</span><span className="metric-symbol amber">⌁</span></div><div className="metric-value">03</div><div className="metric-foot"><span className="foot-neutral">Needs review</span> <span>across 3 departments</span></div><div className="request-dots" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div></article>
            <article className="metric-card"><div className="metric-top"><span>Recommended actions</span><span className="metric-symbol violet">✳</span></div><div className="metric-value">{allocationCount}</div><div className="metric-foot"><span className="foot-neutral">Last run</span> <span>today, 9:42 AM</span></div><div className="action-progress"><span /></div></article>
          </section>

          <div className="content-grid">
            <section className="panel resources-panel" id="resources"><div className="panel-heading"><div><h2>Resource availability</h2><p>Capacity across your campus</p></div><button className="text-button">View all <span>→</span></button></div>
              <div className="resource-list">{resources.map((resource) => <article className="resource-row" key={resource.name}><div className={`resource-icon ${resource.tone}`}>{resource.name.slice(0, 1)}</div><div className="resource-details"><div className="resource-title"><strong>{resource.name}</strong><span>{resource.category}</span></div><div className="capacity-track"><i className={resource.tone} style={{ width: `${(resource.available / resource.total) * 100}%` }} /></div></div><div className="resource-count"><strong>{resource.available}</strong><span>of {resource.total} {resource.unit}</span></div></article>)}</div>
              <div className="resource-legend"><span><i className="legend-dot available" />Available capacity</span><span>Updated today at 9:30 AM</span></div>
            </section>

            <section className="panel requests-panel" id="requests"><div className="panel-heading"><div><h2>Priority requests</h2><p>Ranked by student impact</p></div><span className="queue-badge">3 in queue</span></div>
              <div className="request-list">{requests.map((request, index) => <article className="request-row" key={request.id}><span className={`priority-number priority-${index + 1}`}>0{index + 1}</span><div className="request-info"><strong>{request.title}</strong><span>{request.department} · {request.students} students</span></div><span className={`urgency urgency-${request.urgency}`}>P{6 - request.urgency}</span></article>)}</div>
              <a href="#requests" className="queue-link">Review request queue <span>→</span></a>
            </section>
          </div>

          <section className="optimization-banner" id="insights"><div className="banner-mark">✳</div><div className="banner-copy"><span className="banner-kicker">OPTIMIZATION INSIGHT</span><h2>Small shifts, broader reach.</h2><p>Reallocating 4 unused lab sessions could support 23 additional students this week.</p></div><button className="banner-button" onClick={runOptimization}>Review suggestion <span>→</span></button><div className="banner-decoration" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <i key={index} />)}</div></section>
          </>}
          <footer className="page-footer"><span>CampusFlow <span className="footer-dot">·</span> Academic resource planning</span><span>Academic year 2026–27</span></footer>
        </div>
      </main>
      {selectedMaterial && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedMaterial(null) }}><section className="material-dialog" role="dialog" aria-modal="true" aria-labelledby="material-dialog-title"><button className="dialog-close" aria-label="Close material details" onClick={() => setSelectedMaterial(null)}>×</button><p className="eyebrow">{selectedMaterial.category}</p><h2 id="material-dialog-title">{selectedMaterial.title}</h2><p className="dialog-course">{selectedMaterial.course} <span>·</span> {selectedMaterial.format}</p><p className="dialog-description">{selectedMaterial.description}</p><div className="dialog-byline">Provided by <strong>{selectedMaterial.author}</strong><span>Updated {selectedMaterial.updated}</span></div>{selectedMaterial.link && <a className="primary-button dialog-action resource-link" href={selectedMaterial.link} target="_blank" rel="noreferrer" download={selectedMaterial.title.replace(/\s+/g, '-').toLowerCase() + '.pdf'}>Download resource <span>↗</span></a>}<button className="save-material-button" onClick={() => setSavedMaterials((current) => current.includes(selectedMaterial.id) ? current.filter((id) => id !== selectedMaterial.id) : [...current, selectedMaterial.id])}>{savedMaterials.includes(selectedMaterial.id) ? 'Saved to your list' : 'Save to my materials'}</button>{!selectedMaterial.link && <p className="prototype-note">No resource link is attached to this sample record.</p>}</section></div>}
      {showAddMaterial && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAddMaterial(false) }}><form className="material-dialog add-dialog" onSubmit={addMaterial}><button type="button" className="dialog-close" aria-label="Close add material form" onClick={() => setShowAddMaterial(false)}>×</button><p className="eyebrow">STAFF RESOURCE CONTRIBUTION</p><h2>Add learning material</h2><label className="field-label" htmlFor="material-title">Title</label><input id="material-title" name="title" required maxLength={120} placeholder="e.g. Week 4 lecture notes" /><label className="field-label" htmlFor="material-category">Category</label><select id="material-category" name="category" defaultValue={categories[0].name}>{categories.map((category) => <option key={category.name}>{category.name}</option>)}</select><label className="field-label" htmlFor="material-course">Course</label><input id="material-course" name="course" placeholder="Course code and name" /><label className="field-label" htmlFor="material-format">Format</label><input id="material-format" name="format" placeholder="PDF, video, link…" /><label className="field-label" htmlFor="material-file">Upload PDF file</label><input id="material-file" type="file" accept="application/pdf" onChange={handlePdfUpload} /><div className="uploaded-file-row">{uploadedPdf ? <span className="uploaded-file-name">Selected: {uploadedPdf.name}</span> : <span className="empty-upload-state">No PDF selected</span>}</div><label className="field-label" htmlFor="material-link">Resource URL</label><input id="material-link" name="link" type="url" placeholder="https://university.edu/resource" /><label className="field-label" htmlFor="material-description">Description</label><textarea id="material-description" name="description" rows={3} placeholder="What will students find in this material?" /><button className="primary-button dialog-action" type="submit">Add to library</button></form></div>}
      {showUploadAssignment && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowUploadAssignment(false) }}><form className="material-dialog add-dialog" onSubmit={addStudentAssignment}><button type="button" className="dialog-close" aria-label="Close assignment upload form" onClick={() => setShowUploadAssignment(false)}>×</button><p className="eyebrow">STUDENT SUBMISSION</p><h2>Upload assignment</h2><label className="field-label" htmlFor="assignment-title">Assignment title</label><input id="assignment-title" name="assignment-title" required maxLength={120} placeholder="e.g. AI Lab Record 2" /><label className="field-label" htmlFor="assignment-course">Course</label><input id="assignment-course" name="assignment-course" placeholder="Course code and name" /><label className="field-label" htmlFor="assignment-file">Upload PDF</label><input id="assignment-file" type="file" accept="application/pdf" onChange={handleAssignmentUpload} required /><div className="uploaded-file-row">{uploadedAssignment ? <span className="uploaded-file-name">Selected: {uploadedAssignment.name}</span> : <span className="empty-upload-state">No assignment selected</span>}</div><label className="field-label" htmlFor="assignment-description">Notes</label><textarea id="assignment-description" name="assignment-description" rows={3} placeholder="Add assignment notes or brief summary" /><button className="primary-button dialog-action" type="submit">Submit assignment</button></form></div>}
    </div>
  )
}