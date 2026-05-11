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

  useEffect(() => {
    fetchAll()
  }, [])

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

  async function askAi(question) {
    setAiLoading(true)
    setAiAnswer('')
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
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

  const tasksByStatus = (status) => tasks.filter(t => t.status === status)
  const totalBudget = budget.reduce((a, b) => a + Number(b.total), 0)
  const totalSpent = budget.reduce((a, b) => a + Number(b.spent), 0)
  const budgetPct = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0
  const criticalRisks = risks.filter(r => r.probability * r.impact >= 16)
  const avgOkrProgress = okrs.length ? Math.round(okrs.reduce((a, o) => a + o.progress, 0) / okrs.length) : 0

  const severityColor = (p, i) => {
    const s = p * i
    if (s >= 16) return 'text-red-400 bg-red-400/10'
    if (s >= 9) return 'text-amber-400 bg-amber-400/10'
    if (s >= 4) return 'text-blue-400 bg-blue-400/10'
    return 'text-green-400 bg-green-400/10'
  }

  const severityLabel = (p, i) => {
    const s = p * i
    if (s >= 16) return 'Critical'
    if (s >= 9) return 'High'
    if (s >= 4) return 'Medium'
    return 'Low'
  }

  const statusColor = (status) => {
    const map = {
      'Pass': 'text-green-400 bg-green-400/10',
      'Compliant': 'text-green-400 bg-green-400/10',
      'Done': 'text-green-400 bg-green-400/10',
      'On track': 'text-green-400 bg-green-400/10',
      'Mitigated': 'text-green-400 bg-green-400/10',
      'Pending': 'text-amber-400 bg-amber-400/10',
      'In progress': 'text-amber-400 bg-amber-400/10',
      'In review': 'text-amber-400 bg-amber-400/10',
      'Monitoring': 'text-amber-400 bg-amber-400/10',
      'At risk': 'text-red-400 bg-red-400/10',
      'Overdue': 'text-red-400 bg-red-400/10',
      'Blocked': 'text-red-400 bg-red-400/10',
      'Active': 'text-blue-400 bg-blue-400/10',
      'Planned': 'text-gray-400 bg-gray-400/10',
    }
    return map[status] || 'text-gray-400 bg-gray-400/10'
  }

  const teamColor = (team) => {
    const map = {
      design: 'text-purple-400 bg-purple-400/10',
      eng: 'text-teal-400 bg-teal-400/10',
      data: 'text-amber-400 bg-amber-400/10',
      growth: 'text-coral-400 bg-orange-400/10',
    }
    return map[team] || 'text-gray-400 bg-gray-400/10'
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Loading command center...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-xs font-medium text-white">PM</div>
            <div>
              <h1 className="text-sm font-medium text-white">PM Command Center</h1>
              <p className="text-xs text-gray-500">Brahma Teja · Product & Project Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">Sprint 12 · May 1–14</span>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">On track</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Sprint completion', value: `${Math.round((tasksByStatus('done').length / tasks.length) * 100)}%`, sub: `${tasksByStatus('done').length} of ${tasks.length} tasks`, color: 'text-emerald-400' },
                { label: 'Open risks', value: criticalRisks.length, sub: `${criticalRisks.length} critical`, color: 'text-red-400' },
                { label: 'Budget used', value: `${budgetPct}%`, sub: `$${(totalSpent/1000000).toFixed(1)}M of $${(totalBudget/1000000).toFixed(1)}M`, color: 'text-amber-400' },
                { label: 'OKR progress', value: `${avgOkrProgress}%`, sub: `${okrs.length} objectives`, color: 'text-blue-400' },
              ].map((m, i) => (
                <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{m.label}</p>
                  <p className={`text-2xl font-medium ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-gray-600 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            <div className="bg-white/3 border border-white/5 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-xs text-white font-medium">AI</div>
                <div>
                  <p className="text-sm font-medium text-white">AI insights</p>
                  <p className="text-xs text-gray-500">Powered by Claude · Real data from your project</p>
                </div>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  "What are my top 3 priorities this week?",
                  "Which risks need immediate attention?",
                  "Is my budget on track?",
                  "Which OKRs are at risk?",
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => askAi(q)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={e => setAiQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askAi(aiQuestion)}
                  placeholder="Ask anything about your project..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={() => askAi(aiQuestion)}
                  disabled={aiLoading || !aiQuestion}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs rounded-lg transition-all font-medium"
                >
                  {aiLoading ? '...' : 'Ask'}
                </button>
              </div>

              {aiLoading && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="w-4 h-4 border border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  Claude is analyzing your project data...
                </div>
              )}

              {aiAnswer && (
                <div className="bg-white/3 border border-white/5 rounded-lg p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {aiAnswer}
                </div>
              )}
            </div>

            {/* Team velocity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Team velocity</p>
                {['design','eng','data','growth'].map(team => {
                  const teamTasks = tasks.filter(t => t.team === team)
                  const doneTasks = teamTasks.filter(t => t.status === 'done' || t.status === 'review')
                  const pct = teamTasks.length ? Math.round((doneTasks.length / teamTasks.length) * 100) : 0
                  const colors = { design: 'bg-purple-500', eng: 'bg-teal-500', data: 'bg-amber-500', growth: 'bg-orange-500' }
                  return (
                    <div key={team} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400 capitalize">{team === 'eng' ? 'Engineering' : team}</span>
                        <span className="text-gray-500">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[team]} transition-all`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Sprint snapshot</p>
                {tasks.slice(0, 6).map(task => (
                  <div key={task.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-gray-300 truncate flex-1 mr-2">{task.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(task.status === 'progress' ? 'In progress' : task.status === 'done' ? 'Done' : task.status === 'review' ? 'In review' : 'Planned')}`}>
                      {task.status === 'progress' ? 'In progress' : task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OKRs */}
        {activeTab === 'okrs' && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Objectives</p>
                <p className="text-2xl font-medium text-white">{okrs.length}</p>
              </div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Avg progress</p>
                <p className="text-2xl font-medium text-blue-400">{avgOkrProgress}%</p>
              </div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">At risk</p>
                <p className="text-2xl font-medium text-red-400">{okrs.filter(o => o.progress < 40).length}</p>
              </div>
            </div>
            <div className="space-y-4">
              {okrs.map(okr => (
                <div key={okr.id} className="bg-white/3 border border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-white">{okr.objective}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${okr.progress >= 70 ? 'text-green-400 bg-green-400/10' : okr.progress >= 40 ? 'text-amber-400 bg-amber-400/10' : 'text-red-400 bg-red-400/10'}`}>{okr.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full transition-all ${okr.progress >= 70 ? 'bg-green-500' : okr.progress >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${okr.progress}%` }}></div>
                  </div>
                  {okr.key_results && okr.key_results.map(kr => (
                    <div key={kr.id} className="ml-4 py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-400">{kr.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(kr.status)}`}>{kr.progress}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${kr.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-600">{kr.note}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KANBAN */}
        {activeTab === 'kanban' && (
          <div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {['backlog','progress','review','done'].map(status => (
                <div key={status} className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{status === 'progress' ? 'In progress' : status}</p>
                  <p className="text-2xl font-medium text-white">{tasksByStatus(status).length}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {['backlog','progress','review','done'].map(status => (
                <div
                  key={status}
                  className="bg-white/3 border border-white/5 rounded-xl p-3 min-h-80"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    const id = e.dataTransfer.getData('taskId')
                    moveTask(id, status)
                  }}
                >
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">{status === 'progress' ? 'In progress' : status}</p>
                  {tasksByStatus(status).map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => e.dataTransfer.setData('taskId', task.id)}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing hover:border-white/20 transition-all"
                    >
                      <p className="text-xs text-gray-200 font-medium mb-2 leading-relaxed">{task.title}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${teamColor(task.team)}`}>{task.team === 'eng' ? 'Engineering' : task.team}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{task.points}pts</span>
                          <span className="text-xs text-gray-600">{task.owner}</span>
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
          <div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total</p><p className="text-2xl font-medium text-white">{risks.length}</p></div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Critical</p><p className="text-2xl font-medium text-red-400">{risks.filter(r => r.probability * r.impact >= 16).length}</p></div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">High</p><p className="text-2xl font-medium text-amber-400">{risks.filter(r => { const s = r.probability * r.impact; return s >= 9 && s < 16 }).length}</p></div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Mitigated</p><p className="text-2xl font-medium text-green-400">{risks.filter(r => r.status === 'Mitigated').length}</p></div>
            </div>
            <div className="space-y-3">
              {risks.map(risk => (
                <div key={risk.id} className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-white">{risk.name}</p>
                    <div className="flex gap-2 ml-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${severityColor(risk.probability, risk.impact)}`}>{severityLabel(risk.probability, risk.impact)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(risk.status)}`}>{risk.status}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{risk.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>P: {risk.probability}/5</span>
                    <span>I: {risk.impact}/5</span>
                    <span>Score: {risk.probability * risk.impact}/25</span>
                    <span>Owner: {risk.owner}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-xs text-gray-500"><span className="text-gray-400">Mitigation: </span>{risk.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPLIANCE */}
        {activeTab === 'compliance' && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {['HIPAA','GDPR','CCPA'].map(fw => {
                const items = compliance.filter(c => c.framework === fw)
                const passed = items.filter(c => c.status === 'Pass').length
                return (
                  <div key={fw} className="bg-white/3 border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{fw}</p>
                    <p className={`text-2xl font-medium ${passed === items.length ? 'text-green-400' : passed >= items.length / 2 ? 'text-amber-400' : 'text-red-400'}`}>{passed}/{items.length}</p>
                    <p className="text-xs text-gray-600 mt-1">controls passed</p>
                  </div>
                )
              })}
            </div>
            {['HIPAA','GDPR','CCPA'].map(fw => (
              <div key={fw} className="bg-white/3 border border-white/5 rounded-xl p-5 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">{fw} controls</p>
                {compliance.filter(c => c.framework === fw).map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <p className="text-sm text-gray-300">{item.control}</p>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(item.status)}`}>{item.status}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full text-gray-500 bg-white/5">{item.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* STAKEHOLDERS */}
        {activeTab === 'stakeholders' && (
          <div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total</p><p className="text-2xl font-medium text-white">{stakeholders.length}</p></div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">High influence</p><p className="text-2xl font-medium text-white">{stakeholders.filter(s => s.influence === 'High').length}</p></div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Engaged</p><p className="text-2xl font-medium text-green-400">{stakeholders.filter(s => s.engagement === 'High').length}</p></div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Needs attention</p><p className="text-2xl font-medium text-red-400">{stakeholders.filter(s => s.engagement === 'Low').length}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stakeholders.map(s => (
                <div key={s.id} className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium ${s.engagement === 'Low' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {s.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.role}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Influence</span>
                      <span className="text-gray-300">{s.influence}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Engagement</span>
                      <span className={s.engagement === 'Low' ? 'text-red-400' : s.engagement === 'Medium' ? 'text-amber-400' : 'text-green-400'}>{s.engagement}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Communication</span>
                      <span className="text-gray-300">{s.communication_freq}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FINANCIALS */}
        {activeTab === 'financials' && (
          <div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total budget</p><p className="text-2xl font-medium text-white">${(totalBudget/1000000).toFixed(1)}M</p></div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Spent</p><p className="text-2xl font-medium text-amber-400">${(totalSpent/1000000).toFixed(1)}M</p></div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Remaining</p><p className="text-2xl font-medium text-green-400">${((totalBudget-totalSpent)/1000000).toFixed(1)}M</p></div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Used</p><p className="text-2xl font-medium text-amber-400">{budgetPct}%</p></div>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-xl p-5 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Budget by workstream</p>
              {budget.map(b => {
                const pct = Math.round((Number(b.spent) / Number(b.total)) * 100)
                return (
                  <div key={b.id} className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-300">{b.workstream}</span>
                      <div className="flex gap-3">
                        <span className="text-gray-500">${(Number(b.spent)/1000).toFixed(0)}K / ${(Number(b.total)/1000).toFixed(0)}K</span>
                        <span className={pct >= 85 ? 'text-red-400' : pct >= 70 ? 'text-amber-400' : 'text-green-400'}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 85 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ROADMAP */}
        {activeTab === 'roadmap' && (
          <div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Initiatives</p><p className="text-2xl font-medium text-white">16</p></div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">On track</p><p className="text-2xl font-medium text-green-400">11</p></div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">At risk</p><p className="text-2xl font-medium text-amber-400">3</p></div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Completed</p><p className="text-2xl font-medium text-blue-400">2</p></div>
            </div>
            {[
              { q: 'Q1 · Jan–Mar', items: [['Onboarding redesign','Done'],['Auth v2 migration','Done'],['Retention dashboard','On track'],['SEO content sprint','At risk']] },
              { q: 'Q2 · Apr–Jun', items: [['Mobile app v3','On track'],['API rate limiting','On track'],['Funnel analysis tool','On track'],['Referral program','At risk']] },
              { q: 'Q3 · Jul–Sep', items: [['Design system v2','Planned'],['Infra cost reduction','Planned'],['Predictive churn model','Planned'],['Paid acquisition tests','At risk']] },
              { q: 'Q4 · Oct–Dec', items: [['Accessibility audit','Planned'],['Search v2','Planned'],['Revenue attribution','Planned'],['Partner integrations','Planned']] },
            ].map(({ q, items }) => (
              <div key={q} className="bg-white/3 border border-white/5 rounded-xl p-5 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">{q}</p>
                {items.map(([name, status]) => (
                  <div key={name} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <p className="text-sm text-gray-300">{name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(status)}`}>{status}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}