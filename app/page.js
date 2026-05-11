'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')
  const [tasks, setTasks] = useState([])
  const [risks, setRisks] = useState([])
  const [okrs, setOkrs] = useState([])
  const [compliance, setCompliance] = useState([])
  const [stakeholders, setStakeholders] = useState([])
  const [budget, setBudget] = useState([])
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dragOver, setDragOver] = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [t, r, o, c, s, b] = await Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/risks').then(r => r.json()),
      fetch('/api/okrs').then(r => r.json()),
      fetch('/api/compliance').then(r => r.json()),
      fetch('/api/stakeholders').then(r => r.json()),
      fetch('/api/budget').then(r => r.json()),
    ])
    setTasks(Array.isArray(t) ? t : [])
    setRisks(Array.isArray(r) ? r : [])
    setOkrs(Array.isArray(o) ? o : [])
    setCompliance(Array.isArray(c) ? c : [])
    setStakeholders(Array.isArray(s) ? s : [])
    setBudget(Array.isArray(b) ? b : [])
    setLoading(false)
  }

  async function askAi(q) {
    if (!q) return
    setAiLoading(true)
    setAiAnswer('')
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q })
    })
    const data = await res.json()
    setAiAnswer(data.answer)
    setAiLoading(false)
  }

  async function moveTask(id, newStatus) {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    })
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'okrs', label: 'OKRs' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'kanban', label: 'Kanban' },
    { id: 'risks', label: 'Risks' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'stakeholders', label: 'Stakeholders' },
    { id: 'financials', label: 'Financials' },
  ]

  const byStatus = (s) => tasks.filter(t => t.status === s)
  const totalBudget = budget.reduce((a, b) => a + Number(b.total), 0)
  const totalSpent = budget.reduce((a, b) => a + Number(b.spent), 0)
  const budgetPct = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0
  const criticalRisks = risks.filter(r => r.probability * r.impact >= 16)
  const avgOkr = okrs.length ? Math.round(okrs.reduce((a, o) => a + o.progress, 0) / okrs.length) : 0
  const sprintPct = tasks.length ? Math.round((byStatus('done').length / tasks.length) * 100) : 0

  const sevBadge = (p, i) => {
    const s = p * i
    if (s >= 16) return { label: 'Critical', cls: 'pm-badge pm-badge-red' }
    if (s >= 9) return { label: 'High', cls: 'pm-badge pm-badge-amber' }
    if (s >= 4) return { label: 'Medium', cls: 'pm-badge pm-badge-blue' }
    return { label: 'Low', cls: 'pm-badge pm-badge-green' }
  }

  const sBadge = (s) => {
    const map = {
      'Pass': 'pm-badge pm-badge-green', 'Done': 'pm-badge pm-badge-green',
      'On track': 'pm-badge pm-badge-green', 'Mitigated': 'pm-badge pm-badge-green',
      'Pending': 'pm-badge pm-badge-amber', 'In progress': 'pm-badge pm-badge-amber',
      'In review': 'pm-badge pm-badge-amber', 'Monitoring': 'pm-badge pm-badge-amber',
      'Active': 'pm-badge pm-badge-blue', 'Planned': 'pm-badge pm-badge-gray',
      'At risk': 'pm-badge pm-badge-red', 'Overdue': 'pm-badge pm-badge-red',
      'Blocked': 'pm-badge pm-badge-red',
      'backlog': 'pm-badge pm-badge-gray', 'progress': 'pm-badge pm-badge-blue',
      'review': 'pm-badge pm-badge-amber', 'done': 'pm-badge pm-badge-green',
    }
    return map[s] || 'pm-badge pm-badge-gray'
  }

  const tBadge = (t) => {
    const map = {
      design: 'pm-badge pm-badge-purple',
      eng: 'pm-badge pm-badge-teal',
      data: 'pm-badge pm-badge-amber',
      growth: 'pm-badge pm-badge-orange',
    }
    return map[t] || 'pm-badge pm-badge-gray'
  }

  const tLabel = { design: 'Design', eng: 'Engineering', data: 'Data', growth: 'Growth' }
  const tBarColor = { design: '#8b5cf6', eng: '#14b8a6', data: '#f59e0b', growth: '#f97316' }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '2px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
        <p style={{ color: '#4b5563', fontSize: 13 }}>Loading command center...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#e5e7eb', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #161616' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>PM</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>PM Command Center</div>
              <div style={{ fontSize: 11, color: '#4b5563' }}>Brahma Teja · Product & Project Manager</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 11, padding: '6px 14px', borderRadius: 20, background: '#111', border: '1px solid #1f1f1f', color: '#6b7280' }}>Sprint 12 · May 1–14</span>
            <span style={{ fontSize: 11, padding: '6px 14px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              On track
            </span>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, overflowX: 'auto', paddingBottom: 2 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              fontSize: 12, padding: '8px 16px', borderRadius: 8, border: activeTab === tab.id ? '1px solid #2a2a2a' : '1px solid transparent',
              background: activeTab === tab.id ? '#141414' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#6b7280',
              cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: activeTab === tab.id ? 500 : 400,
              transition: 'all 0.15s'
            }}>{tab.label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {[
                { label: 'Sprint completion', value: `${sprintPct}%`, sub: `${byStatus('done').length} of ${tasks.length} tasks`, color: '#10b981', glow: 'glow-green' },
                { label: 'Critical risks', value: criticalRisks.length, sub: `${risks.length} total risks`, color: '#ef4444', glow: 'glow-red' },
                { label: 'Budget used', value: `${budgetPct}%`, sub: `$${(totalSpent/1e6).toFixed(1)}M of $${(totalBudget/1e6).toFixed(1)}M`, color: '#f59e0b', glow: 'glow-amber' },
                { label: 'OKR progress', value: `${avgOkr}%`, sub: `${okrs.length} objectives`, color: '#3b82f6', glow: 'glow-blue' },
              ].map((m, i) => (
                <div key={i} className={`pm-metric ${m.glow}`}>
                  <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{m.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: m.color, marginBottom: 4, lineHeight: 1 }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: '#374151' }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* AI Panel */}
            <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#10b981' }}>AI</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>AI insights</div>
                  <div style={{ fontSize: 11, color: '#4b5563' }}>Powered by Claude · Reads all your live project data</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {['What are my top 3 priorities this week?','Which risks need immediate attention?','Is my budget on track?','Which OKRs are at risk?'].map((q, i) => (
                  <button key={i} onClick={() => { setAiQuestion(q); askAi(q) }}
                    style={{ fontSize: 11, padding: '7px 14px', borderRadius: 8, background: '#141414', border: '1px solid #1f1f1f', color: '#9ca3af', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseOver={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#2a2a2a' }}
                    onMouseOut={e => { e.target.style.color = '#9ca3af'; e.target.style.borderColor = '#1f1f1f' }}>
                    {q}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <input value={aiQuestion} onChange={e => setAiQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askAi(aiQuestion)}
                  placeholder="Ask anything about your project..."
                  className="pm-input" style={{ flex: 1 }} />
                <button onClick={() => askAi(aiQuestion)} disabled={aiLoading || !aiQuestion} className="pm-btn-primary">
                  {aiLoading ? '...' : 'Ask'}
                </button>
              </div>
              {aiLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#4b5563', fontSize: 13, padding: '8px 0' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', animation: `bounce 1s infinite ${i*150}ms` }}></div>
                    ))}
                  </div>
                  Claude is analyzing your project...
                </div>
              )}
              {aiAnswer && (
                <div style={{ background: '#111', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: 16, fontSize: 13, color: '#d1d5db', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginTop: 8 }}>
                  {aiAnswer}
                </div>
              )}
            </div>

            {/* Bottom row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="pm-card">
                <div className="pm-section-title">Team velocity</div>
                {['design','eng','data','growth'].map(team => {
                  const tt = tasks.filter(t => t.team === team)
                  const done = tt.filter(t => t.status === 'done' || t.status === 'review')
                  const pct = tt.length ? Math.round((done.length / tt.length) * 100) : 0
                  return (
                    <div key={team} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: '#9ca3af' }}>{tLabel[team]}</span>
                        <span style={{ color: '#6b7280' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 4, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: tBarColor[team], borderRadius: 4, transition: 'width 0.7s ease' }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="pm-card">
                <div className="pm-section-title">Sprint snapshot</div>
                {tasks.slice(0, 6).map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #161616' }}>
                    <span style={{ fontSize: 12, color: '#9ca3af', flex: 1, marginRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                    <span className={sBadge(task.status)}>{task.status === 'progress' ? 'In progress' : task.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OKRs */}
        {activeTab === 'okrs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { label: 'Objectives', value: okrs.length, color: '#fff' },
                { label: 'Avg progress', value: `${avgOkr}%`, color: '#3b82f6' },
                { label: 'At risk', value: okrs.filter(o => o.progress < 40).length, color: '#ef4444' },
              ].map((m, i) => (
                <div key={i} className="pm-metric">
                  <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{m.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            {okrs.map(okr => (
              <div key={okr.id} className="pm-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{okr.objective}</div>
                  <span className={okr.progress >= 70 ? 'pm-badge pm-badge-green' : okr.progress >= 40 ? 'pm-badge pm-badge-amber' : 'pm-badge pm-badge-red'}>{okr.progress}%</span>
                </div>
                <div style={{ height: 4, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ height: '100%', width: `${okr.progress}%`, background: okr.progress >= 70 ? '#10b981' : okr.progress >= 40 ? '#f59e0b' : '#ef4444', borderRadius: 4, transition: 'width 0.7s' }}></div>
                </div>
                <div style={{ paddingLeft: 16, borderLeft: '2px solid #1f1f1f' }}>
                  {okr.key_results && okr.key_results.map(kr => (
                    <div key={kr.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #161616' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>{kr.title}</span>
                        <span className={sBadge(kr.status)} style={{ marginLeft: 8, flexShrink: 0 }}>{kr.progress}%</span>
                      </div>
                      <div style={{ height: 2, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ height: '100%', width: `${kr.progress}%`, background: '#3b82f6', borderRadius: 2 }}></div>
                      </div>
                      <div style={{ fontSize: 11, color: '#4b5563' }}>{kr.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KANBAN */}
        {activeTab === 'kanban' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {['backlog','progress','review','done'].map(s => (
                <div key={s} className="pm-metric">
                  <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{s === 'progress' ? 'In progress' : s}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{byStatus(s).length}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {['backlog','progress','review','done'].map(status => (
                <div key={status}
                  style={{ background: dragOver === status ? '#0f1a14' : '#0d0d0d', border: dragOver === status ? '1px solid rgba(16,185,129,0.3)' : '1px solid #1a1a1a', borderRadius: 12, padding: 14, minHeight: 400, transition: 'all 0.2s' }}
                  onDragOver={e => { e.preventDefault(); setDragOver(status) }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => { const id = e.dataTransfer.getData('taskId'); moveTask(id, status); setDragOver(null) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{status === 'progress' ? 'In progress' : status}</span>
                    <span style={{ fontSize: 10, color: '#374151', background: '#141414', border: '1px solid #1f1f1f', borderRadius: 20, padding: '2px 8px' }}>{byStatus(status).length}</span>
                  </div>
                  {byStatus(status).map(task => (
                    <div key={task.id} draggable onDragStart={e => e.dataTransfer.setData('taskId', task.id)}
                      style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 10, padding: 12, marginBottom: 8, cursor: 'grab', transition: 'all 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                      onMouseOut={e => e.currentTarget.style.borderColor = '#1f1f1f'}>
                      <div style={{ fontSize: 12, color: '#e5e7eb', fontWeight: 500, marginBottom: 10, lineHeight: 1.4 }}>{task.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className={tBadge(task.team)}>{tLabel[task.team] || task.team}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, color: '#4b5563' }}>{task.points}pts</span>
                          <span style={{ fontSize: 9, color: '#4b5563', background: '#1a1a1a', border: '1px solid #222', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{task.owner}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RISKS */}
        {activeTab === 'risks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {[
                { label: 'Total', value: risks.length, color: '#fff' },
                { label: 'Critical', value: risks.filter(r => r.probability*r.impact >= 16).length, color: '#ef4444' },
                { label: 'High', value: risks.filter(r => { const s=r.probability*r.impact; return s>=9&&s<16 }).length, color: '#f59e0b' },
                { label: 'Mitigated', value: risks.filter(r => r.status==='Mitigated').length, color: '#10b981' },
              ].map((m,i) => (
                <div key={i} className="pm-metric">
                  <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{m.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {risks.map(risk => {
                const sev = sevBadge(risk.probability, risk.impact)
                return (
                  <div key={risk.id} className="pm-card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{risk.name}</div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 16 }}>
                        <span className={sev.cls}>{sev.label}</span>
                        <span className={sBadge(risk.status)}>{risk.status}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{risk.description}</div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 11, color: '#4b5563', marginBottom: 12 }}>
                      <span>Probability <span style={{ color: '#6b7280' }}>{risk.probability}/5</span></span>
                      <span>Impact <span style={{ color: '#6b7280' }}>{risk.impact}/5</span></span>
                      <span>Score <span style={{ color: '#6b7280' }}>{risk.probability * risk.impact}/25</span></span>
                      <span>Owner <span style={{ color: '#6b7280' }}>{risk.owner}</span></span>
                    </div>
                    <div style={{ paddingTop: 12, borderTop: '1px solid #1a1a1a', fontSize: 12, color: '#6b7280' }}>
                      <span style={{ color: '#4b5563', fontWeight: 500 }}>Mitigation: </span>{risk.mitigation}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* COMPLIANCE */}
        {activeTab === 'compliance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {['HIPAA','GDPR','CCPA'].map(fw => {
                const items = compliance.filter(c => c.framework === fw)
                const passed = items.filter(c => c.status === 'Pass').length
                const color = passed === items.length ? '#10b981' : passed >= items.length/2 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={fw} className="pm-metric">
                    <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{fw}</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color }}>{passed}/{items.length}</div>
                    <div style={{ fontSize: 11, color: '#374151', marginTop: 4 }}>controls passed</div>
                  </div>
                )
              })}
            </div>
            {['HIPAA','GDPR','CCPA'].map(fw => (
              <div key={fw} className="pm-card">
                <div className="pm-section-title">{fw} controls</div>
                {compliance.filter(c => c.framework === fw).map((item, idx, arr) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx < arr.length-1 ? '1px solid #161616' : 'none' }}>
                    <span style={{ fontSize: 13, color: '#d1d5db' }}>{item.control}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className={sBadge(item.status)}>{item.status}</span>
                      <span className="pm-badge pm-badge-gray">{item.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* STAKEHOLDERS */}
        {activeTab === 'stakeholders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {[
                { label: 'Total', value: stakeholders.length, color: '#fff' },
                { label: 'High influence', value: stakeholders.filter(s => s.influence==='High').length, color: '#fff' },
                { label: 'Engaged', value: stakeholders.filter(s => s.engagement==='High').length, color: '#10b981' },
                { label: 'Needs attention', value: stakeholders.filter(s => s.engagement==='Low').length, color: '#ef4444' },
              ].map((m,i) => (
                <div key={i} className="pm-metric">
                  <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{m.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
              {stakeholders.map(s => (
                <div key={s.id} className="pm-card" style={{ borderColor: s.engagement === 'Low' ? 'rgba(239,68,68,0.2)' : '#1f1f1f' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0, background: s.engagement === 'Low' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)', color: s.engagement === 'Low' ? '#f87171' : '#60a5fa', border: s.engagement === 'Low' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(59,130,246,0.2)' }}>
                      {s.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#4b5563' }}>{s.role}</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 12 }}>
                    {[['Influence', s.influence], ['Engagement', s.engagement], ['Communication', s.communication_freq]].map(([k,v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0' }}>
                        <span style={{ color: '#4b5563' }}>{k}</span>
                        <span style={{ color: k === 'Engagement' ? (v === 'Low' ? '#f87171' : v === 'Medium' ? '#fbbf24' : '#34d399') : '#9ca3af' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FINANCIALS */}
        {activeTab === 'financials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {[
                { label: 'Total budget', value: `$${(totalBudget/1e6).toFixed(1)}M`, color: '#fff' },
                { label: 'Spent', value: `$${(totalSpent/1e6).toFixed(1)}M`, color: '#f59e0b' },
                { label: 'Remaining', value: `$${((totalBudget-totalSpent)/1e6).toFixed(1)}M`, color: '#10b981' },
                { label: 'Used', value: `${budgetPct}%`, color: budgetPct > 85 ? '#ef4444' : '#f59e0b' },
              ].map((m,i) => (
                <div key={i} className="pm-metric">
                  <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{m.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div className="pm-card">
              <div className="pm-section-title">Budget by workstream</div>
              {budget.map((b, idx, arr) => {
                const pct = Math.round((Number(b.spent) / Number(b.total)) * 100)
                const color = pct >= 85 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981'
                return (
                  <div key={b.id} style={{ marginBottom: idx < arr.length-1 ? 20 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                      <span style={{ color: '#d1d5db', fontWeight: 500 }}>{b.workstream}</span>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <span style={{ color: '#4b5563' }}>${(Number(b.spent)/1000).toFixed(0)}K / ${(Number(b.total)/1000).toFixed(0)}K</span>
                        <span style={{ color, fontWeight: 600, minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: '#1a1a1a', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 6, transition: 'width 0.7s ease' }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ROADMAP */}
        {activeTab === 'roadmap' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {[
                { label: 'Initiatives', value: 16, color: '#fff' },
                { label: 'On track', value: 11, color: '#10b981' },
                { label: 'At risk', value: 3, color: '#f59e0b' },
                { label: 'Completed', value: 2, color: '#3b82f6' },
              ].map((m,i) => (
                <div key={i} className="pm-metric">
                  <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{m.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            {[
              { q: 'Q1 · Jan – Mar', items: [['Onboarding redesign','Done'],['Auth v2 migration','Done'],['Retention dashboard','On track'],['SEO content sprint','At risk']] },
              { q: 'Q2 · Apr – Jun', items: [['Mobile app v3','On track'],['API rate limiting','On track'],['Funnel analysis tool','On track'],['Referral program','At risk']] },
              { q: 'Q3 · Jul – Sep', items: [['Design system v2','Planned'],['Infra cost reduction','Planned'],['Predictive churn model','Planned'],['Paid acquisition tests','At risk']] },
              { q: 'Q4 · Oct – Dec', items: [['Accessibility audit','Planned'],['Search v2','Planned'],['Revenue attribution','Planned'],['Partner integrations','Planned']] },
            ].map(({ q, items }) => (
              <div key={q} className="pm-card">
                <div className="pm-section-title">{q}</div>
                {items.map(([name, status], idx, arr) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx < arr.length-1 ? '1px solid #161616' : 'none' }}>
                    <span style={{ fontSize: 13, color: '#d1d5db' }}>{name}</span>
                    <span className={sBadge(status)}>{status}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
      `}</style>
    </div>
  )
}