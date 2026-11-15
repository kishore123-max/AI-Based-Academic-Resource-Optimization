// Mock records for the Campus Staff Locator (UI only - no live tracking or GPS).

export type StaffStatus = 'In Cabin' | 'In Lecture Hall' | 'In Lab' | 'In Meeting' | 'Available' | 'Off Campus'

export type BlockId = 'cse' | 'ece' | 'mech' | 'admin' | 'library' | 'science'

export type CampusBlock = { id: BlockId; name: string; short: string; floors: string[]; x: number; y: number; w: number; h: number }

// Coordinates are in the 640x400 SVG viewBox used by the campus map.
export const campusBlocks: CampusBlock[] = [
  { id: 'cse', name: 'CSE Block', short: 'CSE', floors: ['Ground', '1st', '2nd', '3rd'], x: 40, y: 50, w: 190, h: 120 },
  { id: 'ece', name: 'ECE Block', short: 'ECE', floors: ['Ground', '1st', '2nd'], x: 265, y: 50, w: 160, h: 120 },
  { id: 'mech', name: 'Mechanical Block', short: 'MECH', floors: ['Ground', '1st', '2nd'], x: 460, y: 50, w: 140, h: 120 },
  { id: 'admin', name: 'Admin Block', short: 'ADMIN', floors: ['Ground', '1st', '2nd'], x: 40, y: 245, w: 150, h: 110 },
  { id: 'library', name: 'Central Library', short: 'LIB', floors: ['Ground', '1st', '2nd'], x: 225, y: 245, w: 170, h: 110 },
  { id: 'science', name: 'Science Block', short: 'SCI', floors: ['Ground', '1st', '2nd', '3rd'], x: 430, y: 245, w: 170, h: 110 },
]

export type StaffMember = {
  id: string
  name: string
  email: string
  department: string
  designation: string
  status: StaffStatus
  /** Null when the person is not on campus. */
  location: { block: BlockId; floor: number; room: string } | null
  phone: string
  /** Minutes before "now" that the status was last updated. */
  updatedMinutesAgo: number
}

export const staffMembers: StaffMember[] = [
  { id: 'S-001', name: 'Dr. Anika Rao', email: 'anika.rao@campus.edu', department: 'Computer Science & Engineering', designation: 'Professor & HOD', status: 'In Cabin', location: { block: 'cse', floor: 2, room: 'Cabin 204' }, phone: '+91 98400 10021', updatedMinutesAgo: 3 },
  { id: 'S-002', name: 'Prof. Dev Mehta', email: 'dev.mehta@campus.edu', department: 'Electronics & Communication', designation: 'Associate Professor', status: 'In Lab', location: { block: 'ece', floor: 1, room: 'Embedded Systems Lab' }, phone: '+91 98400 10022', updatedMinutesAgo: 8 },
  { id: 'S-003', name: 'Dr. Nisha Kulkarni', email: 'nisha.kulkarni@campus.edu', department: 'Computer Science & Engineering', designation: 'Associate Professor', status: 'In Lecture Hall', location: { block: 'cse', floor: 1, room: 'Lecture Hall 108' }, phone: '+91 98400 10023', updatedMinutesAgo: 12 },
  { id: 'S-004', name: 'Prof. Daniel Kim', email: 'daniel.kim@campus.edu', department: 'Mechanical Engineering', designation: 'Professor & HOD', status: 'In Meeting', location: { block: 'admin', floor: 2, room: 'Board Room' }, phone: '+91 98400 10024', updatedMinutesAgo: 5 },
  { id: 'S-005', name: 'Dr. Meera Iyer', email: 'meera.iyer@campus.edu', department: 'Computer Science & Engineering', designation: 'Assistant Professor', status: 'Available', location: { block: 'cse', floor: 3, room: 'Faculty Room 312' }, phone: '+91 98400 10025', updatedMinutesAgo: 1 },
  { id: 'S-006', name: 'Dr. Rohan Sethi', email: 'rohan.sethi@campus.edu', department: 'Mechanical Engineering', designation: 'Assistant Professor', status: 'In Lab', location: { block: 'mech', floor: 0, room: 'Thermal Engineering Lab' }, phone: '+91 98400 10026', updatedMinutesAgo: 17 },
  { id: 'S-007', name: 'Prof. Leena Nair', email: 'leena.nair@campus.edu', department: 'Physics & Chemistry', designation: 'Professor', status: 'In Lecture Hall', location: { block: 'science', floor: 2, room: 'Seminar Hall S-21' }, phone: '+91 98400 10027', updatedMinutesAgo: 9 },
  { id: 'S-008', name: 'Dr. Karthik Menon', email: 'karthik.menon@campus.edu', department: 'Electronics & Communication', designation: 'Assistant Professor', status: 'In Cabin', location: { block: 'ece', floor: 2, room: 'Cabin 215' }, phone: '+91 98400 10028', updatedMinutesAgo: 4 },
  { id: 'S-009', name: 'Prof. Aditi Sharma', email: 'aditi.sharma@campus.edu', department: 'Physics & Chemistry', designation: 'Associate Professor', status: 'In Lab', location: { block: 'science', floor: 1, room: 'Applied Physics Lab' }, phone: '+91 98400 10029', updatedMinutesAgo: 22 },
  { id: 'S-010', name: 'Mr. Suresh Babu', email: 'suresh.babu@campus.edu', department: 'Library Services', designation: 'Chief Librarian', status: 'Available', location: { block: 'library', floor: 0, room: 'Help Desk' }, phone: '+91 98400 10030', updatedMinutesAgo: 2 },
  { id: 'S-011', name: 'Ms. Priya Venkat', email: 'priya.venkat@campus.edu', department: 'Administration', designation: 'Academic Registrar', status: 'In Cabin', location: { block: 'admin', floor: 1, room: 'Registrar Office 105' }, phone: '+91 98400 10031', updatedMinutesAgo: 6 },
  { id: 'S-012', name: 'Dr. Vikram Joshi', email: 'vikram.joshi@campus.edu', department: 'Computer Science & Engineering', designation: 'Assistant Professor', status: 'Off Campus', location: null, phone: '+91 98400 10032', updatedMinutesAgo: 95 },
  { id: 'S-013', name: 'Prof. Fatima Sheikh', email: 'fatima.sheikh@campus.edu', department: 'Mechanical Engineering', designation: 'Associate Professor', status: 'Available', location: { block: 'mech', floor: 1, room: 'Cabin 118' }, phone: '+91 98400 10033', updatedMinutesAgo: 11 },
  { id: 'S-014', name: 'Campus Administrator', email: 'admin@campus.edu', department: 'Administration', designation: 'System Administrator', status: 'In Cabin', location: { block: 'admin', floor: 0, room: 'IT Services Desk' }, phone: '+91 98400 10000', updatedMinutesAgo: 7 },
]

export const staffDepartments = [...new Set(staffMembers.map((member) => member.department))].sort()

export const statusTone: Record<StaffStatus, 'blue' | 'violet' | 'teal' | 'amber' | 'green' | 'gray'> = {
  'In Cabin': 'blue',
  'In Lecture Hall': 'violet',
  'In Lab': 'teal',
  'In Meeting': 'amber',
  Available: 'green',
  'Off Campus': 'gray',
}

export function floorLabel(block: CampusBlock, floorIndex: number): string {
  const name = block.floors[floorIndex] ?? `Floor ${floorIndex}`
  return name === 'Ground' ? 'Ground Floor' : `${name} Floor`
}
