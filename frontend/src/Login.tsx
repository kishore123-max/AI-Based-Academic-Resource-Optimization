import { type FormEvent, useState } from 'react'
import AnimatedContent from './AnimatedContent'
import Icon from './Icon'
import { authenticate, demoUsers, type DemoUser } from './auth'

const roleLabel: Record<DemoUser['role'], string> = { admin: 'Admin', student: 'Student', staff: 'Staff', hod: 'HOD' }

export default function Login({ onLogin }: { onLogin: (user: DemoUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const user = authenticate(email, password)
    if (!user) {
      setError('That email and password don’t match a demo account. Use one of the demo accounts below.')
      return
    }
    setError('')
    onLogin(user)
  }

  return (
    <main className="login-screen">
      <AnimatedContent className="login-aside" trigger="mount" direction="horizontal" reverse duration={0.9} ease="power3.out" stagger={0.12}>
        <a className="brand login-brand" href="#login"><span className="brand-mark">C</span><span>campus<span className="brand-light">flow</span></span></a>
        <div className="login-story">
          <span className="banner-kicker">ACADEMIC RESOURCE PLANNING</span>
          <h1>Everything your campus needs to thrive.</h1>
          <p>Bring learning materials, campus resources, staff locations, and student support into one clear workspace.</p>
          <div className="login-stats"><span><strong>7</strong> learning libraries</span><span><strong>6</strong> campus blocks</span></div>
        </div>
        <span className="login-footnote">CAMPUSFLOW <i>·</i> ACADEMIC YEAR 2026–27</span>
      </AnimatedContent>
      <AnimatedContent className="login-main" trigger="mount" direction="horizontal" duration={0.9} delay={0.12} ease="power3.out">
        <form className="login-form" onSubmit={submit} noValidate>
          <span className="eyebrow">WELCOME TO CAMPUSFLOW</span>
          <h2>Sign in to your workspace</h2>
          <p className="login-description">Use your institutional email and password.</p>
          <label className="field-label" htmlFor="login-email">Email</label>
          <input id="login-email" type="email" autoComplete="username" placeholder="you@campus.edu" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label className="field-label" htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="primary-button login-submit" type="submit">Sign in <Icon name="arrow" size={16} /></button>

          <div className="demo-accounts">
            <p className="demo-accounts-title">Demo accounts <span>click to fill</span></p>
            {demoUsers.map((user) => (
              <button type="button" className="demo-account" key={user.email} onClick={() => { setEmail(user.email); setPassword(user.password); setError('') }}>
                <span className="demo-account-role">{roleLabel[user.role]}</span>
                <span className="demo-account-creds"><strong>{user.email}</strong><code>{user.password}</code></span>
              </button>
            ))}
          </div>
          <p className="prototype-note">Prototype sign-in only: credentials are checked in the browser against demo accounts, not a real identity service.</p>
        </form>
      </AnimatedContent>
    </main>
  )
}
