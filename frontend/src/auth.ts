// Mock authentication for local demos. There is no server-side auth: credentials
// live in this file and the session is kept in sessionStorage. Replace this module
// with a real identity provider before using the app with real accounts.

export type UserRole = 'student' | 'staff' | 'hod' | 'admin'

export type DemoUser = {
  email: string
  password: string
  name: string
  role: UserRole
  title: string
  registerNumber?: string
}

export const demoUsers: DemoUser[] = [
  { email: 'admin@campus.edu', password: 'Demo@1234', name: 'Campus Administrator', role: 'admin', title: 'Campus administrator' },
  { email: 'student@campus.edu', password: 'User@1234', name: 'Aarav Nair', role: 'student', title: 'Student account', registerNumber: '24CSE1042' },
  { email: 'staff@campus.edu', password: 'Staff@1234', name: 'Dr. Anika Rao', role: 'staff', title: 'Faculty staff' },
  { email: 'hod@campus.edu', password: 'Hod@1234', name: 'Prof. Daniel Kim', role: 'hod', title: 'HOD / Department' },
]

export function authenticate(email: string, password: string): DemoUser | null {
  const normalized = email.trim().toLowerCase()
  return demoUsers.find((user) => user.email === normalized && user.password === password) ?? null
}

const SESSION_KEY = 'campusflow.session'

export function loadSession(): DemoUser | null {
  try {
    const email = sessionStorage.getItem(SESSION_KEY)
    return email ? demoUsers.find((user) => user.email === email) ?? null : null
  } catch {
    return null
  }
}

export function saveSession(user: DemoUser | null) {
  try {
    if (user) sessionStorage.setItem(SESSION_KEY, user.email)
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* storage unavailable (private mode) - session simply won't persist */
  }
}
