import { useState, useEffect } from 'react'
import { Pill, Plus, Clock, CheckCircle, AlertCircle, Trash2, Calendar, Bell } from 'lucide-react'

const ACCENT = '#0ea5e9'

interface Med {
  id: string
  name: string
  dosage: string
  times: string[]
  color: string
  notes: string
}
interface Dose {
  id: string
  medId: string
  medName: string
  time: string
  taken: boolean
  scheduled: string
}

const MED_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899']

export default function App() {
  const [meds, setMeds] = useState<Med[]>([])
  const [doses, setDoses] = useState<Dose[]>([])
  const [tab, setTab] = useState<'today' | 'meds' | 'history'>('today')
  const [addingMed, setAddingMed] = useState(false)
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [times, setTimes] = useState(['08:00'])
  const [medColor, setMedColor] = useState(MED_COLORS[0])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const m = localStorage.getItem('mt_meds')
    const d = localStorage.getItem('mt_doses')
    if (m) setMeds(JSON.parse(m))
    if (d) setDoses(JSON.parse(d))
  }, [])

  function saveMeds(list: Med[]) { setMeds(list); localStorage.setItem('mt_meds', JSON.stringify(list)) }
  function saveDoses(list: Dose[]) { setDoses(list); localStorage.setItem('mt_doses', JSON.stringify(list)) }

  function addMed() {
    if (!name.trim()) return
    const m: Med = { id: Date.now().toString(), name: name.trim(), dosage: dosage.trim(), times: times.filter(t => t), color: medColor, notes: notes.trim() }
    saveMeds([...meds, m])
    setAddingMed(false); setName(''); setDosage(''); setTimes(['08:00']); setNotes('')
  }

  function deleteMed(id: string) { saveMeds(meds.filter(m => m.id !== id)) }

  function takeDose(medId: string, scheduledTime: string) {
    const med = meds.find(m => m.id === medId)
    if (!med) return
    const d: Dose = { id: Date.now().toString(), medId, medName: med.name, time: new Date().toISOString(), taken: true, scheduled: scheduledTime }
    saveDoses([d, ...doses])
  }

  const today = new Date().toDateString()
  const todayDoses = doses.filter(d => new Date(d.time).toDateString() === today)

  function isTakenToday(medId: string, t: string) {
    return todayDoses.some(d => d.medId === medId && d.scheduled === t)
  }

  const todaySchedule = meds.flatMap(m => m.times.map(t => ({ med: m, time: t, taken: isTakenToday(m.id, t) }))).sort((a, b) => a.time.localeCompare(b.time))
  const doneCount = todaySchedule.filter(s => s.taken).length
  const totalCount = todaySchedule.length

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
      <div style={{ background: '#0f1f3d', padding: '1.5rem', borderBottom: '1px solid #1e3a5f' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Pill size={26} style={{ color: ACCENT }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>MedTracker</h1>
          </div>
          {totalCount > 0 && <div style={{ background: doneCount === totalCount ? '#14532d' : '#1e3a5f', borderRadius: 20, padding: '0.3rem 1rem', fontSize: 13, color: doneCount === totalCount ? '#4ade80' : ACCENT }}>{doneCount}/{totalCount} today</div>}
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {(['today', 'meds', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? ACCENT : '#1a2f4a', border: 'none', borderRadius: 10, padding: '0.6rem', color: tab === t ? '#fff' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>{t === 'today' ? 'Today' : t === 'meds' ? 'My Meds' : 'History'}</button>
          ))}
        </div>

        {tab === 'today' && (
          <div>
            {todaySchedule.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#334155' }}>
                <Bell size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ fontSize: 16 }}>No medications scheduled</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>Add medications in the My Meds tab</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {todaySchedule.map((s, i) => (
                  <div key={i} style={{ background: s.taken ? '#0f2d1f' : '#0f1f3d', borderRadius: 14, padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid ' + (s.taken ? '#166534' : '#1e3a5f') }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.med.color, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 15, color: s.taken ? '#86efac' : '#fff' }}>{s.med.name}</p>
                        <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{s.med.dosage} · <Clock size={10} style={{ verticalAlign: 'middle' }} /> {s.time}</p>
                      </div>
                    </div>
                    {s.taken ? (
                      <CheckCircle size={22} style={{ color: '#4ade80' }} />
                    ) : (
                      <button onClick={() => takeDose(s.med.id, s.time)} style={{ background: ACCENT, border: 'none', borderRadius: 10, padding: '0.5rem 1rem', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Take</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'meds' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => setAddingMed(true)} style={{ background: ACCENT, border: 'none', borderRadius: 12, padding: '0.6rem 1.2rem', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> Add Medication</button>
            </div>
            {addingMed && (
              <div style={{ background: '#0f1f3d', borderRadius: 16, padding: '1.5rem', marginBottom: 16, border: '1px solid #1e3a5f' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New Medication</h3>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Medication name" style={{ width: '100%', background: '#1a2f4a', border: '1px solid #2d4f7a', borderRadius: 10, padding: '0.7rem', color: '#fff', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
                <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Dosage (e.g. 10mg)" style={{ width: '100%', background: '#1a2f4a', border: '1px solid #2d4f7a', borderRadius: 10, padding: '0.7rem', color: '#fff', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
                <div style={{ marginBottom: 12 }}>
                  <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Times</p>
                  {times.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input type="time" value={t} onChange={e => { const nt = [...times]; nt[i] = e.target.value; setTimes(nt) }} style={{ background: '#1a2f4a', border: '1px solid #2d4f7a', borderRadius: 8, padding: '0.5rem', color: '#fff', fontSize: 14 }} />
                      {times.length > 1 && <button onClick={() => setTimes(times.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>}
                    </div>
                  ))}
                  <button onClick={() => setTimes([...times, '12:00'])} style={{ background: 'transparent', border: '1px dashed #2d4f7a', borderRadius: 8, padding: '0.4rem 0.8rem', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>+ Add time</button>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Color</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {MED_COLORS.map(c => <div key={c} onClick={() => setMedColor(c)} style={{ width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer', border: medColor === c ? '3px solid #fff' : '3px solid transparent' }} />)}
                  </div>
                </div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} style={{ width: '100%', background: '#1a2f4a', border: '1px solid #2d4f7a', borderRadius: 10, padding: '0.7rem', color: '#fff', fontSize: 13, resize: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addMed} style={{ background: ACCENT, border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setAddingMed(false)} style={{ background: '#1a2f4a', border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', color: '#888', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
            {meds.length === 0 && !addingMed ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#334155' }}>
                <Pill size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p>No medications added yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {meds.map(m => (
                  <div key={m.id} style={{ background: '#0f1f3d', borderRadius: 14, padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e3a5f' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: m.color }} />
                      <div>
                        <p style={{ fontWeight: 600 }}>{m.name}</p>
                        <p style={{ color: '#64748b', fontSize: 12 }}>{m.dosage} · {m.times.join(', ')}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteMed(m.id)} style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {doses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#334155' }}>
                <Calendar size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p>No dose history yet</p>
              </div>
            ) : doses.slice(0, 50).map(d => (
              <div key={d.id} style={{ background: '#0f1f3d', borderRadius: 12, padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e3a5f' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={16} style={{ color: '#4ade80' }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{d.medName}</p>
                    <p style={{ color: '#64748b', fontSize: 12 }}>{new Date(d.time).toLocaleString()}</p>
                  </div>
                </div>
                <span style={{ color: '#4ade80', fontSize: 12 }}>Taken</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
