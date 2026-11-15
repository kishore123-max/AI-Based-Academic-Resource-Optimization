import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon'
import { campusBlocks, floorLabel, staffDepartments, staffMembers, statusTone, type BlockId, type StaffMember } from './staffData'
import './locator.css'

type Toast = { id: number; message: string; tone: 'success' | 'info' }

const sampleEmails = ['anika.rao@campus.edu', 'dev.mehta@campus.edu', 'leena.nair@campus.edu']

function initials(name: string) {
  return name.replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, '').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function relativeTime(minutes: number) {
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} hr ${rest} min ago` : `${hours} hr ago`
}

function Highlight({ text, query }: { text: string; query: string }) {
  const index = query ? text.toLowerCase().indexOf(query) : -1
  if (index < 0) return <>{text}</>
  return <>{text.slice(0, index)}<mark>{text.slice(index, index + query.length)}</mark>{text.slice(index + query.length)}</>
}

function CampusMap({ member }: { member: StaffMember }) {
  const location = member.location
  const active = location ? campusBlocks.find((block) => block.id === location.block) : undefined
  return (
    <svg className="campus-map" viewBox="0 0 640 400" role="img" aria-label={active ? `Campus map showing ${active.name}` : 'Campus map. This staff member is not on campus.'}>
      <rect className="map-lawn" x="8" y="8" width="624" height="384" rx="22" />
      <rect className="map-road" x="8" y="178" width="624" height="58" />
      <path className="map-road-line" d="M20 207H620" />
      <rect className="map-road" x="300" y="236" width="40" height="156" />
      <path className="map-road-line" d="M320 240V380" />
      <g className="map-gate">
        <rect x="288" y="368" width="64" height="22" rx="11" />
        <text x="320" y="383" textAnchor="middle">Main Gate</text>
      </g>
      {campusBlocks.map((block) => {
        const isActive = block.id === location?.block
        return (
          <g key={block.id} className={isActive ? 'map-block active' : 'map-block'}>
            <rect x={block.x} y={block.y} width={block.w} height={block.h} rx="14" />
            <text className="map-block-name" x={block.x + block.w / 2} y={block.y + block.h / 2 - 2} textAnchor="middle">{block.short}</text>
            <text className="map-block-sub" x={block.x + block.w / 2} y={block.y + block.h / 2 + 18} textAnchor="middle">{block.name}</text>
          </g>
        )
      })}
      {active && (
        <g className="map-pin" transform={`translate(${active.x + active.w - 28} ${active.y + 28})`}>
          <circle className="map-pin-pulse" r="16" />
          <circle className="map-pin-dot" r="9" />
          <circle className="map-pin-core" r="3.5" />
        </g>
      )}
    </svg>
  )
}

export default function StaffLocator() {
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('all')
  const [blockFilter, setBlockFilter] = useState<BlockId | 'off' | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string>(staffMembers[0].id)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [now] = useState(() => Date.now())
  const detailRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const normalizedQuery = query.trim().toLowerCase()

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const results = useMemo(() => staffMembers.filter((member) => {
    const matchesEmail = !normalizedQuery || member.email.toLowerCase().includes(normalizedQuery)
    const matchesDepartment = department === 'all' || member.department === department
    const matchesBlock = blockFilter === 'all' || (blockFilter === 'off' ? member.location === null : member.location?.block === blockFilter)
    return matchesEmail && matchesDepartment && matchesBlock
  }), [normalizedQuery, department, blockFilter])

  // Derived selection: if the chosen person is filtered out, fall back to the first result.
  const selected = results.find((member) => member.id === selectedId) ?? results[0] ?? null
  const block = selected?.location ? campusBlocks.find((item) => item.id === selected.location!.block) : undefined
  const hasFilters = Boolean(normalizedQuery) || department !== 'all' || blockFilter !== 'all'

  const notify = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current.slice(-2), { id, message, tone }])
    timers.current.push(window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4000))
  }, [])

  function choose(member: StaffMember) {
    setSelectedId(member.id)
    if (window.matchMedia('(max-width: 960px)').matches) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function reset() {
    setQuery('')
    setDepartment('all')
    setBlockFilter('all')
  }

  async function copyEmail(member: StaffMember) {
    try {
      await navigator.clipboard.writeText(member.email)
      notify(`Copied ${member.email}`)
    } catch {
      notify(`Email: ${member.email}`, 'info')
    }
  }

  function directionsText(member: StaffMember) {
    if (!member.location || !block) return ''
    return `Main Gate → ${block.name} → ${floorLabel(block, member.location.floor)} → ${member.location.room}`
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">CAMPUS DIRECTORY</p>
          <h1>Staff Locator</h1>
          <p className="subheading">Find where a faculty or staff member is right now, by their email ID.</p>
        </div>
        <span className="demo-badge">DEMO DATA · NO LIVE TRACKING</span>
      </section>

      <section className="locator-search panel" aria-label="Search staff">
        <label className="locator-search-box">
          <Icon name="search" size={18} />
          <span className="visually-hidden">Staff email ID</span>
          <input
            type="search"
            inputMode="email"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search by email ID, e.g. anika.rao@campus.edu"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter' && results[0]) choose(results[0]) }}
          />
        </label>
        <label className="locator-filter">
          <span>Department</span>
          <select value={department} onChange={(event) => setDepartment(event.target.value)}>
            <option value="all">All departments</option>
            {staffDepartments.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="locator-filter">
          <span>Block</span>
          <select value={blockFilter} onChange={(event) => setBlockFilter(event.target.value as BlockId | 'off' | 'all')}>
            <option value="all">All blocks</option>
            {campusBlocks.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            <option value="off">Off campus</option>
          </select>
        </label>
        <div className="locator-search-foot">
          <span className="locator-try">Try:{sampleEmails.map((email) => <button type="button" key={email} onClick={() => setQuery(email)}>{email}</button>)}</span>
          {hasFilters && <button type="button" className="text-button" onClick={reset}>Clear filters</button>}
        </div>
      </section>

      <p className="result-count locator-count" role="status" aria-live="polite">{results.length} of {staffMembers.length} staff {results.length === 1 ? 'member' : 'members'} shown</p>

      {results.length === 0 || !selected ? (
        <div className="empty-state">
          <span><Icon name="search" size={22} /></span>
          <h3>No staff found</h3>
          <p>No email ID matches “{query.trim()}” with the current filters. Check the spelling, or try something like anika.rao@campus.edu.</p>
          <button type="button" className="primary-button" onClick={reset}>Clear search</button>
        </div>
      ) : (
        <div className="locator-layout">
          <ul className="staff-list" aria-label="Matching staff">
            {results.map((member) => (
              <li key={member.id}>
                <button type="button" className={member.id === selected.id ? 'staff-item active' : 'staff-item'} aria-current={member.id === selected.id ? 'true' : undefined} onClick={() => choose(member)}>
                  <span className={`staff-avatar tone-${statusTone[member.status]}`}>{initials(member.name)}</span>
                  <span className="staff-item-text">
                    <strong>{member.name}</strong>
                    <small><Highlight text={member.email} query={normalizedQuery} /></small>
                  </span>
                  <span className={`status-pill tone-${statusTone[member.status]}`}><i />{member.status}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="locator-detail" ref={detailRef}>
            <article className="panel staff-card">
              <div className="staff-card-head">
                <span className={`staff-avatar large tone-${statusTone[selected.status]}`}>{initials(selected.name)}</span>
                <div>
                  <h2>{selected.name}</h2>
                  <p>{selected.designation}</p>
                </div>
                <span className={`status-pill big tone-${statusTone[selected.status]}`}><i />{selected.status}</span>
              </div>
              <dl className="staff-facts">
                <div><dt><Icon name="mail" size={15} />Email ID</dt><dd>{selected.email}</dd></div>
                <div><dt><Icon name="building" size={15} />Department</dt><dd>{selected.department}</dd></div>
                <div><dt><Icon name="phone" size={15} />Phone</dt><dd>{selected.phone}</dd></div>
                <div><dt><Icon name="clock" size={15} />Last updated</dt><dd>{relativeTime(selected.updatedMinutesAgo)} · {new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date(now - selected.updatedMinutesAgo * 60000))}</dd></div>
              </dl>
              <div className="quick-actions" role="group" aria-label={`Quick actions for ${selected.name}`}>
                <button type="button" className="action-button" onClick={() => notify(`Opening ${selected.name}’s schedule (demo - no schedule is loaded).`, 'info')}><Icon name="calendar" size={16} />View Schedule</button>
                <button type="button" className="action-button" onClick={() => notify(`Quick ping sent to ${selected.name}.`)}><Icon name="send" size={16} />Send Quick Ping</button>
                <button type="button" className="action-button" disabled={!selected.location} onClick={() => notify(`Route: ${directionsText(selected)}`, 'info')}><Icon name="nav" size={16} />Get Directions</button>
                <button type="button" className="action-button subtle" onClick={() => void copyEmail(selected)}><Icon name="copy" size={16} />Copy email</button>
              </div>
            </article>

            <article className="panel location-card">
              <div className="panel-heading">
                <div>
                  <h2>Current location</h2>
                  <p>{selected.location && block ? `${block.name} – ${floorLabel(block, selected.location.floor)}, ${selected.location.room}` : 'Not on campus right now'}</p>
                </div>
                {block && <span className="queue-badge">{block.short}</span>}
              </div>
              <div className="location-body">
                <CampusMap member={selected} />
                <div className="floor-panel" aria-label="Floor indicator">
                  {selected.location && block ? (
                    <>
                      <p className="floor-title">{block.name}</p>
                      <ol className="floor-stack">
                        {block.floors.map((_, index) => block.floors.length - 1 - index).map((floorIndex) => {
                          const here = floorIndex === selected.location!.floor
                          return (
                            <li key={floorIndex} className={here ? 'floor-row here' : 'floor-row'}>
                              <span>{floorLabel(block, floorIndex)}</span>
                              {here && <strong><Icon name="door" size={14} />{selected.location!.room}</strong>}
                            </li>
                          )
                        })}
                      </ol>
                    </>
                  ) : (
                    <div className="floor-off">
                      <Icon name="info" size={20} />
                      <strong>Off campus</strong>
                      <span>Last seen {relativeTime(selected.updatedMinutesAgo)}. Directions are unavailable until they return.</span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>
      )}

      <div className="toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div className={`toast ${toast.tone}`} key={toast.id} role="status">
            <Icon name={toast.tone === 'success' ? 'check' : 'info'} size={16} />
            <span>{toast.message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}><Icon name="close" size={14} /></button>
          </div>
        ))}
      </div>
    </>
  )
}
