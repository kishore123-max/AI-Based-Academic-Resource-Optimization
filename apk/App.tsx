import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000'

const requests = [
  { title: 'Intro biology lab access', department: 'Life sciences', students: 46, priority: 'P1' },
  { title: 'Evening study spaces', department: 'Student services', students: 32, priority: 'P2' },
  { title: 'Laptop lending pool', department: 'Digital learning', students: 58, priority: 'P2' },
]

const materials = [
  { category: 'Notes / Study Materials', title: 'Cell Biology: exam revision notes', detail: 'BIO 204 · PDF · 24 pages' },
  { category: 'Educational Videos', title: 'Organic chemistry: reaction pathways', detail: 'CHEM 221 · Video · 38 min' },
  { category: 'Previous Year Question Papers', title: 'Calculus II final examination', detail: 'MATH 202 · PDF · 2025' },
  { category: 'E-Books', title: 'Research methods in education', detail: 'EDU 310 · EPUB · 12 MB' },
  { category: 'Lab Materials', title: 'Physics laboratory handbook', detail: 'PHYS 115 · PDF · 42 pages' },
  { category: 'Faculty Materials', title: 'Data structures: lecture slides', detail: 'CS 240 · PDF · 68 slides' },
  { category: 'Assignments', title: 'Statistics problem set 04', detail: 'STAT 210 · PDF · Due Oct 20' },
]

const roles = ['Student', 'Staff', 'Academic'] as const

export default function App() {
  const [role, setRole] = useState<(typeof roles)[number]>('Student')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'library'>('overview')
  const [category, setCategory] = useState('All resources')
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'offline'>('checking')
  const [isChecking, setIsChecking] = useState(false)

  async function checkApi() {
    setIsChecking(true)
    try {
      const response = await fetch(`${apiUrl}/health`)
      setApiStatus(response.ok ? 'connected' : 'offline')
    } catch {
      setApiStatus('offline')
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    void checkApi()
  }, [])

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.loginScreen}>
          <View style={styles.brandRow}><View style={styles.brandMark}><Text style={styles.brandMarkText}>C</Text></View><Text style={styles.brand}>campus<Text style={styles.brandLight}>flow</Text></Text></View>
          <Text style={styles.eyebrow}>ACADEMIC RESOURCE PLANNING</Text>
          <Text style={styles.loginTitle}>Your campus,{ '\n' }in balance.</Text>
          <Text style={styles.subtitle}>Sign in to learning resources and campus support.</Text>
          <Text style={styles.loginLabel}>YOUR ROLE</Text>
          <View style={styles.rolePicker}>{roles.map((item) => <Pressable key={item} style={[styles.roleOption, role === item && styles.roleSelected]} onPress={() => setRole(item)}><Text style={[styles.roleText, role === item && styles.roleTextSelected]}>{item}</Text></Pressable>)}</View>
          <Text style={styles.loginLabel}>INSTITUTIONAL EMAIL</Text>
          <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="you@university.edu" style={styles.loginInput} value={email} onChangeText={setEmail} />
          <Text style={styles.loginLabel}>PASSWORD</Text>
          <TextInput autoCapitalize="none" autoComplete="password" placeholder="At least 8 characters" secureTextEntry style={styles.loginInput} value={password} onChangeText={setPassword} />
          <Pressable style={styles.refreshButton} onPress={() => { if (email.includes('@') && password.length >= 8) setIsSignedIn(true) }}><Text style={styles.refreshText}>Continue as {role}</Text><Text style={styles.refreshArrow}>→</Text></Pressable>
          <Text style={styles.loginNote}>Prototype sign-in. Campus authentication is not connected.</Text>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.header}>
          <View style={styles.brandRow}><View style={styles.brandMark}><Text style={styles.brandMarkText}>C</Text></View><Text style={styles.brand}>campus<Text style={styles.brandLight}>flow</Text></Text></View>
          <Pressable onPress={() => { setIsSignedIn(false); setPassword('') }}><Text style={styles.term}>{role.toUpperCase()} · SIGN OUT</Text></Pressable>
        </View>

        <View style={styles.tabBar}><Pressable style={[styles.tabButton, activeTab === 'overview' && styles.tabSelected]} onPress={() => setActiveTab('overview')}><Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextSelected]}>Overview</Text></Pressable><Pressable style={[styles.tabButton, activeTab === 'library' && styles.tabSelected]} onPress={() => setActiveTab('library')}><Text style={[styles.tabText, activeTab === 'library' && styles.tabTextSelected]}>Learning library</Text></Pressable></View>

        {activeTab === 'library' ? <>
          <Text style={styles.eyebrow}>CAMPUS KNOWLEDGE HUB</Text>
          <Text style={styles.libraryTitle}>Learning library</Text>
          <Text style={styles.subtitle}>Browse course materials and study resources.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryStrip}>
            {['All resources', ...materials.map((item) => item.category)].map((item) => <Pressable key={item} style={[styles.categoryChip, category === item && styles.categoryChipSelected]} onPress={() => setCategory(item)}><Text style={[styles.categoryChipText, category === item && styles.categoryChipTextSelected]}>{item}</Text></Pressable>)}
          </ScrollView>
          <View style={styles.materialList}>{materials.filter((item) => category === 'All resources' || item.category === category).map((item) => <View style={styles.materialRow} key={item.category}><Text style={styles.materialCategory}>{item.category}</Text><Text style={styles.materialTitle}>{item.title}</Text><Text style={styles.materialDetail}>{item.detail}</Text></View>)}</View>
        </> : <>
        <Text style={styles.eyebrow}>ACADEMIC RESOURCE PLANNING</Text>
        <Text style={styles.title}>Your campus,{ '\n' }in balance.</Text>
        <Text style={styles.subtitle}>A live view of student needs and available support.</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statLabel}>UTILIZATION</Text><Text style={styles.statValue}>78<Text style={styles.percent}>%</Text></Text><Text style={styles.statNote}>+6.4% this month</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>STUDENTS REACHED</Text><Text style={styles.statValue}>2,840</Text><Text style={styles.statNote}>Across 3 departments</Text></View>
        </View>

        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Priority requests</Text><Text style={styles.queueCount}>03 IN QUEUE</Text></View>
        <View style={styles.requestList}>{requests.map((request, index) => (
          <View style={styles.requestRow} key={request.title}>
            <Text style={[styles.requestNumber, index === 0 && styles.requestNumberTop]}>0{index + 1}</Text>
            <View style={styles.requestCopy}><Text style={styles.requestTitle}>{request.title}</Text><Text style={styles.requestMeta}>{request.department} · {request.students} students</Text></View>
            <Text style={styles.priority}>{request.priority}</Text>
          </View>
        ))}</View>

        <View style={styles.apiCard}><View style={[styles.statusDot, apiStatus === 'connected' ? styles.statusOnline : apiStatus === 'offline' ? styles.statusOffline : styles.statusPending]} /><View style={styles.apiCopy}><Text style={styles.apiTitle}>Optimization service</Text><Text style={styles.apiDescription}>{apiStatus === 'connected' ? 'Connected and ready' : apiStatus === 'offline' ? 'Not reachable right now' : 'Checking connection…'}</Text></View>{apiStatus === 'checking' && <ActivityIndicator size="small" color="#315f42" />}</View>
        <Pressable style={({ pressed }) => [styles.refreshButton, pressed && styles.buttonPressed]} onPress={checkApi} disabled={isChecking}><Text style={styles.refreshText}>{isChecking ? 'Checking…' : 'Check connection'}</Text><Text style={styles.refreshArrow}>→</Text></Pressable>
        </>}
        <Text style={styles.footer}>CAMPUSFLOW  ·  ACADEMIC YEAR 2026–27</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f9f6' },
  screen: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 32 },
  loginScreen: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 25, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, paddingBottom: 42 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#315f42' },
  brandMarkText: { color: '#ffffff', fontFamily: 'Georgia', fontSize: 19 },
  brand: { color: '#25342a', fontSize: 17, fontWeight: '700' },
  brandLight: { color: '#718078', fontWeight: '400' },
  term: { color: '#728078', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  eyebrow: { color: '#718a77', fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  title: { marginTop: 9, color: '#1f3025', fontFamily: 'Georgia', fontSize: 39, lineHeight: 43 },
  subtitle: { marginTop: 9, color: '#7c8880', fontSize: 12, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 25 },
  statCard: { flex: 1, minHeight: 122, padding: 14, borderWidth: 1, borderColor: '#e5ebe5', borderRadius: 8, backgroundColor: '#ffffff' },
  statLabel: { color: '#8b968e', fontSize: 8, fontWeight: '700', letterSpacing: 0.7 },
  statValue: { marginTop: 16, color: '#27382c', fontFamily: 'Georgia', fontSize: 28 },
  percent: { color: '#64776a', fontFamily: 'System', fontSize: 15 },
  statNote: { marginTop: 4, color: '#548261', fontSize: 9 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 11 },
  sectionTitle: { color: '#2d3c32', fontFamily: 'Georgia', fontSize: 18 },
  queueCount: { color: '#977440', fontSize: 8, fontWeight: '700', letterSpacing: 0.6 },
  requestList: { paddingHorizontal: 13, borderWidth: 1, borderColor: '#e5ebe5', borderRadius: 8, backgroundColor: '#ffffff' },
  requestRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#f0f2ef' },
  requestNumber: { color: '#9a8b6c', fontFamily: 'Georgia', fontSize: 12 },
  requestNumberTop: { color: '#b66f54' },
  requestCopy: { flex: 1, gap: 4 },
  requestTitle: { color: '#36443a', fontSize: 10, fontWeight: '600' },
  requestMeta: { color: '#929d94', fontSize: 8 },
  priority: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 4, backgroundColor: '#fbefeb', color: '#a96851', fontSize: 8, fontWeight: '700' },
  apiCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, padding: 13, borderWidth: 1, borderColor: '#e5ebe5', borderRadius: 8, backgroundColor: '#ffffff' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusOnline: { backgroundColor: '#63a57b' },
  statusOffline: { backgroundColor: '#d17c62' },
  statusPending: { backgroundColor: '#d3ae62' },
  apiCopy: { flex: 1, gap: 4 },
  apiTitle: { color: '#36443a', fontSize: 10, fontWeight: '600' },
  apiDescription: { color: '#89958c', fontSize: 9 },
  refreshButton: { minHeight: 42, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, marginTop: 10, borderRadius: 6, backgroundColor: '#315f42' },
  buttonPressed: { opacity: 0.82 },
  refreshText: { color: '#ffffff', fontSize: 10, fontWeight: '600' },
  refreshArrow: { color: '#c5e1ce', fontSize: 13 },
  footer: { marginTop: 27, color: '#9aa49c', textAlign: 'center', fontSize: 8, letterSpacing: 0.5 },
  loginTitle: { marginTop: 25, color: '#1f3025', fontFamily: 'Georgia', fontSize: 36, lineHeight: 40 },
  loginLabel: { marginTop: 20, marginBottom: 7, color: '#718078', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  rolePicker: { flexDirection: 'row', gap: 6, padding: 4, borderWidth: 1, borderColor: '#e5ebe5', borderRadius: 7, backgroundColor: '#ffffff' },
  roleOption: { flex: 1, minHeight: 35, alignItems: 'center', justifyContent: 'center', borderRadius: 5 },
  roleSelected: { backgroundColor: '#eaf2ec' },
  roleText: { color: '#77847a', fontSize: 10 },
  roleTextSelected: { color: '#315f42', fontWeight: '700' },
  loginInput: { minHeight: 43, paddingHorizontal: 11, borderWidth: 1, borderColor: '#e2e8e2', borderRadius: 5, backgroundColor: '#ffffff', color: '#334238', fontSize: 11 },
  loginNote: { marginTop: 13, color: '#929d94', textAlign: 'center', fontSize: 9 },
  tabBar: { flexDirection: 'row', gap: 7, marginBottom: 25, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e5ebe5' },
  tabButton: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 5 },
  tabSelected: { backgroundColor: '#eaf2ec' },
  tabText: { color: '#7d8980', fontSize: 10 },
  tabTextSelected: { color: '#315f42', fontWeight: '700' },
  libraryTitle: { marginTop: 8, color: '#1f3025', fontFamily: 'Georgia', fontSize: 29 },
  categoryStrip: { gap: 7, paddingVertical: 18 },
  categoryChip: { paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#e3eae4', borderRadius: 16, backgroundColor: '#ffffff' },
  categoryChipSelected: { borderColor: '#315f42', backgroundColor: '#315f42' },
  categoryChipText: { color: '#637067', fontSize: 9 },
  categoryChipTextSelected: { color: '#ffffff' },
  materialList: { gap: 8 },
  materialRow: { padding: 13, borderWidth: 1, borderColor: '#e5ebe5', borderRadius: 7, backgroundColor: '#ffffff' },
  materialCategory: { color: '#6c8b72', fontSize: 8, fontWeight: '700' },
  materialTitle: { marginTop: 7, color: '#35443a', fontFamily: 'Georgia', fontSize: 14 },
  materialDetail: { marginTop: 5, color: '#8a968d', fontSize: 9 },
})