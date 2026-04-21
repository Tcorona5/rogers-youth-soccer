'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Game } from '../../../lib/supabase'

const DIVISIONS = [
  { slug: 'u9b',  name: 'U9 Boys' },
  { slug: 'u9g',  name: 'U9 Girls' },
  { slug: 'u11b', name: 'U11 Boys' },
  { slug: 'u11g', name: 'U11 Girls' },
  { slug: '6thb', name: '6th Grade Boys' },
  { slug: 'jvb',  name: 'JV Boys' },
  { slug: 'jvg',  name: 'JV Girls' },
  { slug: 'vb',   name: 'Varsity Boys' },
  { slug: 'vg',   name: 'Varsity Girls' },
  { slug: 'u18',  name: 'U18 Co-Ed' },
]

const ROGERS_GREEN = '#2D7A3A'

type ScoreEdit = { home: string; away: string }

function cleanTeamName(name: string): string {
  return Array.from(name).filter(c => {
    const cp = c.codePointAt(0) || 0
    return cp < 0x1F3F4 || (cp > 0x1F3F4 && cp < 0xE0000) || cp > 0xE007F
  }).join('').trim()
}

function formatDate(d: string | null, t: string | null): string {
  if (!d) return ''
  try {
    const dt = new Date(d + 'T12:00:00')
    const date = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    return t ? `${date} · ${t}` : date
  } catch { return d }
}

export default function AdminScores() {
  const router = useRouter()
  const [activeDiv, setActiveDiv] = useState('u9b')
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState<Record<number, ScoreEdit>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const [filterUnscored, setFilterUnscored] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!sessionStorage.getItem('rys_admin')) router.replace('/admin/login')
    }
  }, [router])

  const loadGames = useCallback(async (slug: string) => {
    setLoading(true)
    setEdits({})
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('division_slug', slug)
      .order('game_date', { ascending: true })
    setGames(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadGames(activeDiv) }, [activeDiv, loadGames])

  const setEdit = (id: number, field: 'home' | 'away', val: string) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }))
  }

  const saveScore = async (game: Game) => {
    const edit = edits[game.id]
    if (!edit) return
    const home = parseInt(edit.home)
    const away = parseInt(edit.away)
    if (isNaN(home) || isNaN(away)) return
    setSaving(game.id)
    await supabase.from('games').update({ home_score: home, away_score: away }).eq('id', game.id)
    setGames(prev => prev.map(g => g.id === game.id ? { ...g, home_score: home, away_score: away } : g))
    setSaving(null)
    setSaved(game.id)
    setTimeout(() => setSaved(null), 2000)
    setEdits(prev => { const n = { ...prev }; delete n[game.id]; return n })
  }

  const updateStatus = async (game: Game, status: string) => {
    const updates: Record<string, unknown> = { status }
    if (status === 'rained_out_no_makeup' || status === 'rained_out_makeup_tbd') {
      updates.is_cancelled = true
      updates.home_score = null
      updates.away_score = null
    } else if (status === 'pending') {
      updates.is_cancelled = false
    }
    await supabase.from('games').update(updates).eq('id', game.id)
    setGames(prev => prev.map(g => g.id === game.id ? { ...g, ...updates } as Game : g))
  }

  const clearScore = async (game: Game) => {
    if (!confirm(`Clear score for Game #${game.game_number}?`)) return
    await supabase.from('games').update({ home_score: null, away_score: null }).eq('id', game.id)
    setGames(prev => prev.map(g => g.id === game.id ? { ...g, home_score: null, away_score: null } : g))
  }

  const displayedGames = games.filter(g => {
    if (g.is_cancelled) return false
    if (filterUnscored) return g.home_score === null
    return true
  })

  const scoredCount = games.filter(g => !g.is_cancelled && g.home_score !== null).length
  const totalCount = games.filter(g => !g.is_cancelled).length

  // Group games by date
  const grouped: Record<string, Game[]> = {}
  for (const g of displayedGames) {
    const key = g.game_date || 'Unknown'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(g)
  }
  const sortedDates = Object.keys(grouped).sort()

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top navbar */}
      <header style={{ background: ROGERS_GREEN, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/Logo_White.png" alt="Rogers" style={{ height: '36px', width: 'auto' }} />
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>Score Entry</p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>Rogers Youth Soccer Admin</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/" target="_blank" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', textDecoration: 'none' }}>
            View Site →
          </a>
          <button
            onClick={() => { sessionStorage.removeItem('rys_admin'); router.replace('/admin/login') }}
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}
          >
            Log Out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Page title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: 0 }}>Enter Scores</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Record final results for completed games</p>
        </div>

        {/* Division + filter bar */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DIVISIONS.map(d => (
              <button
                key={d.slug}
                onClick={() => setActiveDiv(d.slug)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeDiv === d.slug ? 'none' : '1px solid #d1d5db',
                  background: activeDiv === d.slug ? ROGERS_GREEN : 'white',
                  color: activeDiv === d.slug ? 'white' : '#374151',
                  boxShadow: activeDiv === d.slug ? '0 2px 6px rgba(45,122,58,0.3)' : 'none',
                }}
              >
                {d.name}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              <strong style={{ color: '#111827' }}>{scoredCount}</strong> of <strong style={{ color: '#111827' }}>{totalCount}</strong> scored
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterUnscored}
                onChange={e => setFilterUnscored(e.target.checked)}
                style={{ width: '14px', height: '14px' }}
              />
              Unscored only
            </label>
          </div>
        </div>

        {/* Games list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading…</div>
        ) : sortedDates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            {filterUnscored ? 'All games are scored! 🎉' : 'No games found.'}
          </div>
        ) : (
          <div>
            {sortedDates.map(date => (
              <div key={date} style={{ marginBottom: '24px' }}>
                {/* Date header */}
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', paddingLeft: '4px' }}>
                  {formatDate(date, null)}
                </p>

                {/* Game cards */}
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  {grouped[date].map((game, idx) => {
                    const edit = edits[game.id]
                    const hasEdit = edit && (edit.home !== '' || edit.away !== '')
                    const isSaving = saving === game.id
                    const wasSaved = saved === game.id
                    const notCounting = !game.counts_for_standings
                    const isScored = game.home_score !== null

                    return (
                      <div
                        key={game.id}
                        style={{
                          padding: '16px 20px',
                          borderBottom: idx < grouped[date].length - 1 ? '1px solid #f3f4f6' : 'none',
                          background: wasSaved ? '#f0fdf4' : 'white',
                          opacity: notCounting ? 0.55 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {/* Division badge + time */}
                        <div style={{ minWidth: '120px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: ROGERS_GREEN, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {DIVISIONS.find(d => d.slug === game.division_slug)?.name}
                          </span>
                          {game.game_time && (
                            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{game.game_time}</p>
                          )}
                          {notCounting && (
                            <p style={{ fontSize: '11px', color: '#f59e0b', marginTop: '2px' }}>Away game</p>
                          )}
                        </div>

                        {/* Teams */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                            {cleanTeamName(game.home_team)}
                            <span style={{ color: '#d1d5db', fontWeight: 400, margin: '0 8px' }}>vs</span>
                            {cleanTeamName(game.away_team)}
                          </p>
                          {game.field && (
                            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                              #{game.game_number} · {game.field}
                            </p>
                          )}
                        </div>

                        {/* Status dropdown */}
                        <div style={{ minWidth: '180px' }}>
                          <select
                            value={game.status || 'pending'}
                            onChange={e => updateStatus(game, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '7px 10px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              background: 'white',
                              color: game.status === 'rained_out_no_makeup' ? '#dc2626'
                                   : game.status === 'rained_out_makeup_tbd' ? '#f59e0b'
                                   : game.status === 'final' ? '#16a34a'
                                   : '#374151',
                            }}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="final">✅ Final</option>
                            <option value="rained_out_no_makeup">🌧️ Rained Out · No Makeup</option>
                            <option value="rained_out_makeup_tbd">🌧️ Rained Out · Makeup TBD</option>
                          </select>
                        </div>

                        {/* Score entry */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {(game.status === 'rained_out_no_makeup' || game.status === 'rained_out_makeup_tbd') ? (
                            <div style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>No score needed</div>
                          ) : isScored && !hasEdit ? (
                            <>
                              <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '8px 16px', fontSize: '18px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{game.home_score}</span>
                                <span style={{ color: '#d1d5db', fontWeight: 300 }}>–</span>
                                <span>{game.away_score}</span>
                              </div>
                              <button
                                onClick={() => setEdits(prev => ({ ...prev, [game.id]: { home: String(game.home_score), away: String(game.away_score) } }))}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontSize: '12px', cursor: 'pointer' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => clearScore(game)}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fca5a5', background: 'white', color: '#dc2626', fontSize: '12px', cursor: 'pointer' }}
                              >
                                Clear
                              </button>
                            </>
                          ) : (
                            <>
                              <input
                                type="number" min="0" max="99" placeholder="H"
                                value={edit?.home ?? ''}
                                onChange={e => setEdit(game.id, 'home', e.target.value)}
                                style={{ width: '56px', textAlign: 'center', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px', fontSize: '16px', fontWeight: 700, outline: 'none' }}
                              />
                              <span style={{ color: '#9ca3af', fontSize: '16px' }}>–</span>
                              <input
                                type="number" min="0" max="99" placeholder="A"
                                value={edit?.away ?? ''}
                                onChange={e => setEdit(game.id, 'away', e.target.value)}
                                style={{ width: '56px', textAlign: 'center', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px', fontSize: '16px', fontWeight: 700, outline: 'none' }}
                              />
                              <button
                                onClick={() => saveScore(game)}
                                disabled={!hasEdit || isSaving}
                                style={{
                                  padding: '8px 20px', borderRadius: '8px', border: 'none',
                                  background: wasSaved ? '#16a34a' : hasEdit ? ROGERS_GREEN : '#d1d5db',
                                  color: 'white', fontSize: '13px', fontWeight: 600, cursor: hasEdit ? 'pointer' : 'not-allowed',
                                }}
                              >
                                {isSaving ? '…' : wasSaved ? '✓ Saved' : 'Save'}
                              </button>
                              {hasEdit && (
                                <button
                                  onClick={() => setEdits(prev => { const n = { ...prev }; delete n[game.id]; return n })}
                                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#6b7280', fontSize: '13px', cursor: 'pointer' }}
                                >
                                  Cancel
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
