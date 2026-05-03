'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const ROGERS_GREEN = '#2D7A3A'

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

const ROUND_ORDER = ['Play-in', 'First Round', 'Quarterfinals', 'Semifinals', 'Championship']
const ROUND_COLORS: Record<string, string> = {
  'Play-in':      '#7c3aed',
  'First Round':  '#0369a1',
  'Quarterfinals':'#0369a1',
  'Semifinals':   '#d97706',
  'Championship': '#dc2626',
}

type PlayoffGame = {
  id: number
  game_number: string
  division_slug: string
  round: string
  game_date: string
  game_time: string
  location: string
  field: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  winner: string | null
  next_game_number: string | null
  next_game_slot: string | null
}

export default function AdminPlayoffs() {
  const router = useRouter()
  const [activeDiv, setActiveDiv] = useState('u9b')
  const [games, setGames] = useState<PlayoffGame[]>([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState<Record<number, { home: string; away: string }>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!sessionStorage.getItem('rys_admin')) router.replace('/admin/login')
    }
  }, [router])

  const loadGames = useCallback(async (slug: string) => {
    setLoading(true)
    setEdits({})
    const { data } = await supabase
      .from('playoff_games')
      .select('*')
      .eq('division_slug', slug)
      .order('game_number', { ascending: true })
    setGames(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadGames(activeDiv) }, [activeDiv, loadGames])

  const saveScore = async (game: PlayoffGame) => {
    const edit = edits[game.id]
    if (!edit) return
    const hs = parseInt(edit.home)
    const as_ = parseInt(edit.away)
    if (isNaN(hs) || isNaN(as_)) return

    setSaving(game.id)

    const winner = hs > as_ ? game.home_team : hs < as_ ? game.away_team : ''
    
    // Update this game
    await supabase.from('playoff_games')
      .update({ home_score: hs, away_score: as_, winner: winner || null })
      .eq('id', game.id)

    // If there's a winner and a next game, advance them
    if (winner && game.next_game_number) {
      const slot = game.next_game_slot === 'home' ? 'home_team' : 'away_team'
      await supabase.from('playoff_games')
        .update({ [slot]: winner })
        .eq('game_number', game.next_game_number)
        .eq('division_slug', game.division_slug)
    }

    // Refresh games
    const { data } = await supabase
      .from('playoff_games')
      .select('*')
      .eq('division_slug', activeDiv)
      .order('game_number', { ascending: true })
    setGames(data || [])

    setSaving(null)
    setSaved(game.id)
    setTimeout(() => setSaved(null), 2000)
    setEdits(prev => { const n = { ...prev }; delete n[game.id]; return n })
  }

  const clearScore = async (game: PlayoffGame) => {
    if (!confirm(`Clear score for Game #${game.game_number}? This will also remove the winner from the next round.`)) return

    // Clear score and winner from this game
    await supabase.from('playoff_games')
      .update({ home_score: null, away_score: null, winner: null })
      .eq('id', game.id)

    // Clear the team from the next game slot
    if (game.winner && game.next_game_number) {
      const slot = game.next_game_slot === 'home' ? 'home_team' : 'away_team'
      await supabase.from('playoff_games')
        .update({ [slot]: '' })
        .eq('game_number', game.next_game_number)
        .eq('division_slug', game.division_slug)
    }

    const { data } = await supabase
      .from('playoff_games')
      .select('*')
      .eq('division_slug', activeDiv)
      .order('game_number', { ascending: true })
    setGames(data || [])
  }

  // Group by round
  const grouped: Record<string, PlayoffGame[]> = {}
  for (const g of games) {
    if (!grouped[g.round]) grouped[g.round] = []
    grouped[g.round].push(g)
  }
  const sortedRounds = ROUND_ORDER.filter(r => grouped[r])
  const completedCount = games.filter(g => g.winner).length

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Navbar */}
      <header style={{ background: ROGERS_GREEN, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/Logo_White.png" alt="Rogers" style={{ height: '36px', width: 'auto' }} />
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>Playoff Bracket</p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>Rogers Youth Soccer Admin</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/admin/scores" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', textDecoration: 'none' }}>Regular Season →</a>
          <a href="/playoffs" target="_blank" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', textDecoration: 'none' }}>View Bracket →</a>
          <button
            onClick={() => { sessionStorage.removeItem('rys_admin'); router.replace('/admin/login') }}
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}
          >Log Out</button>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: 0 }}>🏆 Playoff Score Entry</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Enter a score and save — the winner automatically advances to the next round on the public bracket.</p>
        </div>

        {/* Division + stats bar */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {DIVISIONS.map(d => (
              <button
                key={d.slug}
                onClick={() => setActiveDiv(d.slug)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  border: activeDiv === d.slug ? 'none' : '1px solid #d1d5db',
                  background: activeDiv === d.slug ? ROGERS_GREEN : 'white',
                  color: activeDiv === d.slug ? 'white' : '#374151',
                  boxShadow: activeDiv === d.slug ? '0 2px 6px rgba(45,122,58,0.3)' : 'none',
                }}
              >{d.name}</button>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            <strong style={{ color: '#111827' }}>{completedCount}</strong> of <strong style={{ color: '#111827' }}>{games.length}</strong> games completed
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sortedRounds.map(round => {
              const color = ROUND_COLORS[round] || ROGERS_GREEN
              const isChamp = round === 'Championship'
              return (
                <div key={round} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  {/* Round header */}
                  <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', background: isChamp ? '#fff7ed' : '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ background: color, color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {round}
                    </span>
                    {isChamp && <span>🏆</span>}
                    <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>
                      {grouped[round].filter(g => g.winner).length}/{grouped[round].length} played
                    </span>
                  </div>

                  {/* Games */}
                  {grouped[round].map((game, idx) => {
                    const edit = edits[game.id]
                    const hasEdit = edit && edit.home !== '' && edit.away !== ''
                    const isSaving = saving === game.id
                    const wasSaved = saved === game.id
                    const isPlayed = game.winner !== null
                    const noTeams = !game.home_team && !game.away_team
                    const partialTeams = !game.home_team || !game.away_team

                    return (
                      <div
                        key={game.id}
                        style={{
                          padding: '16px 24px',
                          borderBottom: idx < grouped[round].length - 1 ? '1px solid #f3f4f6' : 'none',
                          background: wasSaved ? '#f0fdf4' : isPlayed ? '#fafafa' : 'white',
                        }}
                      >
                        {/* Meta row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: color, background: `${color}15`, border: `1px solid ${color}40`, padding: '2px 8px', borderRadius: '10px' }}>
                              #{game.game_number}
                            </span>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>{game.game_date} · {game.game_time}</span>
                            {game.field && <span style={{ fontSize: '12px', color: '#9ca3af' }}>· {game.location} {game.field}</span>}
                          </div>
                          {isPlayed && (
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>
                              ✓ {game.winner} advances
                            </span>
                          )}
                        </div>

                        {/* Score row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          {/* Home */}
                          <div style={{ flex: 1, textAlign: 'right' }}>
                            <span style={{
                              fontSize: '15px', fontWeight: game.winner === game.home_team ? 700 : 500,
                              color: game.winner ? (game.winner === game.home_team ? '#111827' : '#9ca3af') : '#374151'
                            }}>
                              {game.home_team || <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>TBD</span>}
                            </span>
                          </div>

                          {/* Center */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '220px' }}>
                            {noTeams ? (
                              <span style={{ color: '#d1d5db', fontStyle: 'italic', fontSize: '13px' }}>Waiting for previous results</span>
                            ) : isPlayed && !edit ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '8px 20px', fontSize: '20px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span>{game.home_score}</span>
                                  <span style={{ color: '#d1d5db', fontWeight: 300 }}>–</span>
                                  <span>{game.away_score}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <button
                                    onClick={() => setEdits(prev => ({ ...prev, [game.id]: { home: String(game.home_score), away: String(game.away_score) } }))}
                                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontSize: '11px', cursor: 'pointer' }}
                                  >Edit</button>
                                  <button
                                    onClick={() => clearScore(game)}
                                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #fca5a5', background: 'white', color: '#dc2626', fontSize: '11px', cursor: 'pointer' }}
                                  >Clear</button>
                                </div>
                              </div>
                            ) : partialTeams && !isPlayed ? (
                              <span style={{ color: '#fbbf24', fontStyle: 'italic', fontSize: '13px' }}>Waiting for opponent</span>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input
                                  type="number" min="0" max="99" placeholder="0"
                                  value={edit?.home ?? ''}
                                  onChange={e => setEdits(prev => ({ ...prev, [game.id]: { ...prev[game.id], home: e.target.value } }))}
                                  style={{ width: '56px', textAlign: 'center', border: '2px solid #e5e7eb', borderRadius: '8px', padding: '8px 4px', fontSize: '20px', fontWeight: 700, outline: 'none' }}
                                />
                                <span style={{ color: '#9ca3af', fontSize: '20px', fontWeight: 300 }}>–</span>
                                <input
                                  type="number" min="0" max="99" placeholder="0"
                                  value={edit?.away ?? ''}
                                  onChange={e => setEdits(prev => ({ ...prev, [game.id]: { ...prev[game.id], away: e.target.value } }))}
                                  style={{ width: '56px', textAlign: 'center', border: '2px solid #e5e7eb', borderRadius: '8px', padding: '8px 4px', fontSize: '20px', fontWeight: 700, outline: 'none' }}
                                />
                                <button
                                  onClick={() => saveScore(game)}
                                  disabled={!hasEdit || isSaving}
                                  style={{
                                    padding: '9px 20px', borderRadius: '8px', border: 'none',
                                    background: wasSaved ? '#16a34a' : hasEdit ? ROGERS_GREEN : '#e5e7eb',
                                    color: hasEdit ? 'white' : '#9ca3af',
                                    fontSize: '13px', fontWeight: 600, cursor: hasEdit ? 'pointer' : 'not-allowed',
                                  }}
                                >
                                  {isSaving ? '…' : wasSaved ? '✓ Saved' : 'Save'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Away */}
                          <div style={{ flex: 1 }}>
                            <span style={{
                              fontSize: '15px', fontWeight: game.winner === game.away_team ? 700 : 500,
                              color: game.winner ? (game.winner === game.away_team ? '#111827' : '#9ca3af') : '#374151'
                            }}>
                              {game.away_team || <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>TBD</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
