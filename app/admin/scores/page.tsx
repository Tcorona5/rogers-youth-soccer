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

type ScoreEdit = { home: string; away: string }

export default function AdminScores() {
  const router = useRouter()
  const [activeDiv, setActiveDiv] = useState('u7b')
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

  const clearScore = async (game: Game) => {
    if (!confirm(`Clear score for Game #${game.game_number}?`)) return
    await supabase.from('games').update({ home_score: null, away_score: null }).eq('id', game.id)
    setGames(prev => prev.map(g => g.id === game.id ? { ...g, home_score: null, away_score: null } : g))
  }

  const displayedGames = filterUnscored
    ? games.filter(g => !g.is_cancelled && g.home_score === null)
    : games.filter(g => !g.is_cancelled)

  const formatDate = (d: string | null, t: string | null) => {
    if (!d) return ''
    try {
      const dt = new Date(d + 'T12:00:00')
      return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + (t ? ` · ${t}` : '')
    } catch { return d }
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <header style={{ background: '#0A1628' }} className="shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold">Score Entry</h1>
            <p className="text-gray-400 text-xs">Rogers Youth Soccer Admin</p>
          </div>
          <div className="flex gap-3">
            <a href="/" target="_blank" className="text-gray-400 hover:text-white text-sm transition-colors">
              View Site →
            </a>
            <button
              onClick={() => { sessionStorage.removeItem('rys_admin'); router.replace('/admin/login') }}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>
      <div style={{ background: '#C8A84B', height: '3px' }} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Division picker */}
        <div className="mb-5">
          <div className="flex gap-2 flex-wrap">
            {DIVISIONS.map(d => (
              <button
                key={d.slug}
                onClick={() => setActiveDiv(d.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeDiv === d.slug
                    ? 'text-white shadow'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                }`}
                style={activeDiv === d.slug ? { background: '#0A1628' } : {}}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500 text-sm">
            {games.filter(g => !g.is_cancelled && g.home_score !== null).length} of{' '}
            {games.filter(g => !g.is_cancelled).length} games scored
          </p>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={filterUnscored}
              onChange={e => setFilterUnscored(e.target.checked)}
              className="rounded"
            />
            Show unscored only
          </label>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : (
          <div className="space-y-2">
            {displayedGames.map(game => {
              const edit = edits[game.id]
              const hasEdit = edit && (edit.home !== '' || edit.away !== '')
              const isSaving = saving === game.id
              const wasSaved = saved === game.id
              const notCounting = !game.counts_for_standings

              return (
                <div
                  key={game.id}
                  className={`bg-white rounded-xl border p-4 ${notCounting ? 'opacity-60' : ''} ${wasSaved ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Game info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <span className="font-mono">#{game.game_number}</span>
                        <span>·</span>
                        <span>{formatDate(game.game_date, game.game_time)}</span>
                        {game.field && <><span>·</span><span>{game.field}</span></>}
                        {notCounting && <span className="text-orange-400 font-medium">(away game)</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <span>{game.home_flag}</span>
                        <span>{game.home_team}</span>
                        <span className="text-gray-300">vs</span>
                        <span>{game.away_team}</span>
                        <span>{game.away_flag}</span>
                      </div>
                    </div>

                    {/* Score entry */}
                    <div className="flex items-center gap-2 shrink-0">
                      {game.home_score !== null && !hasEdit ? (
                        <>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-bold text-gray-700">
                            <span>{game.home_score}</span>
                            <span className="text-gray-400">–</span>
                            <span>{game.away_score}</span>
                          </div>
                          <button
                            onClick={() => setEdits(prev => ({
                              ...prev,
                              [game.id]: { home: String(game.home_score), away: String(game.away_score) }
                            }))}
                            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => clearScore(game)}
                            className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded"
                          >
                            Clear
                          </button>
                        </>
                      ) : (
                        <>
                          <input
                            type="number"
                            min="0"
                            max="99"
                            placeholder="H"
                            value={edit?.home ?? ''}
                            onChange={e => setEdit(game.id, 'home', e.target.value)}
                            className="w-14 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': '#007A87' } as React.CSSProperties}
                          />
                          <span className="text-gray-400 font-light">–</span>
                          <input
                            type="number"
                            min="0"
                            max="99"
                            placeholder="A"
                            value={edit?.away ?? ''}
                            onChange={e => setEdit(game.id, 'away', e.target.value)}
                            className="w-14 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': '#007A87' } as React.CSSProperties}
                          />
                          <button
                            onClick={() => saveScore(game)}
                            disabled={!hasEdit || isSaving}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 ${wasSaved ? 'bg-green-500' : ''}`}
                            style={!wasSaved ? { background: '#007A87' } : {}}
                          >
                            {isSaving ? '…' : wasSaved ? '✓' : 'Save'}
                          </button>
                          {hasEdit && (
                            <button
                              onClick={() => setEdits(prev => { const n = { ...prev }; delete n[game.id]; return n })}
                              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {displayedGames.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                {filterUnscored ? 'All games are scored! 🎉' : 'No games found.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
