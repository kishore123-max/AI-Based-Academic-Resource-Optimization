export type SemesterSubject = {
  code: string
  name: string
  credits: number
  marks: number
  attendance: number
}

export type SemesterRecord = {
  semester: number
  gpa: string
  result: 'Passed' | 'In progress'
  subjects: SemesterSubject[]
}

const coursePlans = [
  [
    ['ENG101', 'Engineering Mathematics I', 4],
    ['ENG102', 'Engineering Physics', 4],
    ['ENG103', 'Basic Electrical Engineering', 3],
    ['ENG104', 'Engineering Graphics', 3],
    ['ENG105', 'Programming Fundamentals', 3],
    ['ENG106', 'Communication Skills', 2],
  ],
  [
    ['ENG201', 'Engineering Mathematics II', 4],
    ['ENG202', 'Engineering Chemistry', 4],
    ['ENG203', 'Basic Electronics', 3],
    ['ENG204', 'Workshop Practice', 2],
    ['ENG205', 'Object-Oriented Programming', 3],
    ['ENG206', 'Environmental Studies', 2],
  ],
  [
    ['CSE301', 'Discrete Mathematics', 4],
    ['CSE302', 'Data Structures and Algorithms', 4],
    ['CSE303', 'Digital Logic Design', 3],
    ['CSE304', 'Computer Organization', 3],
    ['CSE305', 'Object-Oriented Design', 3],
    ['CSE306', 'Data Structures Laboratory', 2],
  ],
  [
    ['CSE401', 'Probability and Statistics', 4],
    ['CSE402', 'Database Management Systems', 4],
    ['CSE403', 'Operating Systems', 4],
    ['CSE404', 'Theory of Computation', 3],
    ['CSE405', 'Computer Networks', 3],
    ['CSE406', 'Database Systems Laboratory', 2],
  ],
  [
    ['CSE501', 'Design and Analysis of Algorithms', 4],
    ['CSE502', 'Software Engineering', 3],
    ['CSE503', 'Artificial Intelligence', 3],
    ['CSE504', 'Web Application Development', 3],
    ['CSE505', 'Computer Networks Laboratory', 2],
    ['CSE506', 'Open Elective I', 3],
  ],
  [
    ['CSE601', 'Compiler Design', 4],
    ['CSE602', 'Machine Learning', 4],
    ['CSE603', 'Information Security', 3],
    ['CSE604', 'Distributed Systems', 3],
    ['CSE605', 'Cloud Computing Laboratory', 2],
    ['CSE606', 'Open Elective II', 3],
  ],
  [
    ['CSE701', 'Deep Learning', 4],
    ['CSE702', 'Internet of Things', 3],
    ['CSE703', 'Mobile Application Development', 3],
    ['CSE704', 'Project Phase I', 4],
    ['CSE705', 'Professional Ethics', 2],
    ['CSE706', 'Program Elective I', 3],
  ],
  [
    ['CSE801', 'Data Science and Analytics', 4],
    ['CSE802', 'Program Elective II', 3],
    ['CSE803', 'Program Elective III', 3],
    ['CSE804', 'Major Project', 8],
    ['CSE805', 'Technical Seminar', 2],
  ],
]

export const semesterRecords: SemesterRecord[] = coursePlans.map((courses, index) => {
  const semester = index + 1
  const inProgress = semester === 8
  const subjects = courses.map(([code, name, credits], subjectIndex) => ({
    code: String(code),
    name: String(name),
    credits: Number(credits),
    marks: inProgress ? 0 : 68 + ((semester * 7 + subjectIndex * 5) % 29),
    attendance: 72 + ((semester * 9 + subjectIndex * 4) % 27),
  }))
  const gpa = inProgress
    ? '—'
    : (7.1 + ((semester * 13) % 19) / 10).toFixed(1)

  return {
    semester,
    gpa,
    result: inProgress ? 'In progress' : 'Passed',
    subjects,
  }
})

export const examDates = [
  '2026-11-02',
  '2026-11-05',
  '2026-11-09',
  '2026-11-12',
  '2026-11-16',
  '2026-11-19',
]