'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, type Game, type Division, type StandingsRow } from '../lib/supabase'

const DIVISIONS: Division[] = [
  { slug: 'u9b',  display_name: 'U9 Boys',        sort_order: 1 },
  { slug: 'u9g',  display_name: 'U9 Girls',       sort_order: 2 },
  { slug: 'u11b', display_name: 'U11 Boys',       sort_order: 3 },
  { slug: 'u11g', display_name: 'U11 Girls',      sort_order: 4 },
  { slug: '6thb', display_name: '6th Grade Boys', sort_order: 5 },
  { slug: 'jvb',  display_name: 'JV Boys',        sort_order: 6 },
  { slug: 'jvg',  display_name: 'JV Girls',       sort_order: 7 },
  { slug: 'vb',   display_name: 'Varsity Boys',   sort_order: 8 },
  { slug: 'vg',   display_name: 'Varsity Girls',  sort_order: 9 },
  { slug: 'u18',  display_name: 'U18 Co-Ed',      sort_order: 10 },
]

const ROGERS_GREEN = '#2D7A3A'

function flagEmojiToCode(emoji: string): string {
  if (!emoji) return ''
  try {
    const codePoints = Array.from(emoji).map(c => c.codePointAt(0)! - 0x1F1E6)
    if (codePoints.length < 2 || codePoints[0] < 0 || codePoints[1] < 0) return ''
    return String.fromCharCode(65 + codePoints[0], 65 + codePoints[1]).toLowerCase()
  } catch { return '' }
}

const NAME_FLAG_OVERRIDES: Record<string, string> = {
  'England': 'gb-eng',
  'Scotland': 'gb-sct',
  'Wales': 'gb-wls',
}

function FlagImg({ emoji, size = 22, name = '' }: { emoji: string; size?: number; name?: string }) {
  const code = NAME_FLAG_OVERRIDES[name] || flagEmojiToCode(emoji)
  if (!code) return null
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={name || code.toUpperCase()}
      width={size}
      height={Math.round(size * 0.67)}
      style={{ objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
    />
  )
}

function computeStandings(games: Game[]): StandingsRow[] {
  const map: Record<string, StandingsRow> = {}
  const ensure = (team: string, flag: string) => {
    if (!map[team]) map[team] = { team, flag, gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
  }
  for (const g of games) {
    if (!g.counts_for_standings || g.is_cancelled) continue
    if (g.home_score === null || g.away_score === null) continue
    ensure(g.home_team, g.home_flag)
    ensure(g.away_team, g.away_flag)
    const h = map[g.home_team]
    const a = map[g.away_team]
    h.gp++; h.gf += g.home_score; h.ga += g.away_score; h.gd = h.gf - h.ga
    a.gp++; a.gf += g.away_score; a.ga += g.home_score; a.gd = a.gf - a.ga
    if (g.home_score > g.away_score) { h.w++; h.pts += 3; a.l++ }
    else if (g.home_score < g.away_score) { a.w++; a.pts += 3; h.l++ }
    else { h.d++; h.pts++; a.d++; a.pts++ }
  }
  return Object.values(map).sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.ga - b.ga
  )
}

function formatDate(dateStr: string | null, timeStr: string | null): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T12:00:00')
    const date = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    return timeStr ? `${date} · ${timeStr}` : date
  } catch { return dateStr }
}

export default function HomePage() {
  const [activeDiv, setActiveDiv] = useState('u9b')
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  const loadGames = useCallback(async (slug: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('division_slug', slug)
      .order('game_date', { ascending: true })
    setGames(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadGames(activeDiv) }, [activeDiv, loadGames])

  const standings = computeStandings(games)
  const completed = games
    .filter(g => !g.is_cancelled && g.home_score !== null && g.counts_for_standings)
    .sort((a, b) => (b.game_date || '').localeCompare(a.game_date || ''))

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Navbar — Rogers green, clean like adult site */}
      <header style={{ background: ROGERS_GREEN }} className="shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 style={{ color: "white", fontWeight: 700, fontSize: "24px", letterSpacing: "-0.5px" }}>Rogers Youth Soccer</h1>
            <p style={{ color: "white", fontSize: "13px", marginTop: "2px", opacity: 0.85 }}>Spring 2026 · Rogers Activity Center</p>
          </div>
          <div className="text-right hidden sm:block">
            <span style={{ color: "white", fontSize: "13px", opacity: 0.85 }}>🌍 World Cup Season</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Division selector */}
        <div className="mb-8">
          <div className="flex gap-2 flex-wrap">
            {DIVISIONS.map(d => (
              <button
                key={d.slug}
                onClick={() => setActiveDiv(d.slug)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={
                  activeDiv === d.slug
                    ? { background: ROGERS_GREEN, color: 'white', boxShadow: '0 2px 8px rgba(45,122,58,0.3)' }
                    : { background: 'white', color: '#374151', border: '1px solid #d1d5db' }
                }
              >
                {d.display_name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : (
          <div className="space-y-8">
            <StandingsTable standings={standings} />
            {completed.length > 0 && <ResultsTable completed={completed} />}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: ROGERS_GREEN }} className="mt-12 py-5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-green-100 text-sm">Rogers Activity Center · Spring 2026</p>
          <p className="text-green-300 text-xs mt-1">For questions contact Rogers Parks &amp; Recreation</p>
        </div>
      </footer>
    </div>
  )
}

function StandingsTable({ standings }: { standings: StandingsRow[] }) {
  if (standings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="text-5xl mb-4">⚽</div>
        <p className="text-gray-600 font-semibold">No results recorded yet</p>
        <p className="text-gray-400 text-sm mt-1">Standings will appear once games are played</p>
      </div>
    )
  }

  const cellStyle = (extra?: object) => ({
    textAlign: 'center' as const,
    padding: '18px 8px',
    fontSize: '14px',
    ...extra,
  })

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      <div style={{ padding: "24px 24px 0 24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Standings</h2>
        <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>Win 3 pts · Draw 1 pt · Loss 0 pts</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '48px' }} />
            <col />
            <col style={{ width: '64px' }} />
            <col style={{ width: '64px' }} />
            <col style={{ width: '64px' }} />
            <col style={{ width: '64px' }} />
            <col style={{ width: '72px' }} />
            <col style={{ width: '72px' }} />
            <col style={{ width: '72px' }} />
            <col style={{ width: '72px' }} />
          </colgroup>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>#</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Team</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>P</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>W</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>D</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em' }}>L</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>GF</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>GA</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>GD</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: ROGERS_GREEN, textTransform: 'uppercase', letterSpacing: '0.08em' }}>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr
                key={row.team}
                style={{
                  borderBottom: '1px solid #f3f4f6',
                  background: i === 0 ? '#f0fdf4' : 'white',
                }}
              >
                <td style={{ ...cellStyle(), color: '#9ca3af', fontWeight: 600 }}>{i + 1}</td>
                <td style={{ padding: '18px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FlagImg emoji={row.flag} size={26} name={row.team} />
                    <span style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{row.team}</span>
                  </div>
                </td>
                <td style={{ ...cellStyle(), color: '#6b7280', fontWeight: 500 }}>{row.gp}</td>
                <td style={{ ...cellStyle(), color: '#16a34a', fontWeight: 700 }}>{row.w}</td>
                <td style={{ ...cellStyle(), color: '#9ca3af', fontWeight: 500 }}>{row.d}</td>
                <td style={{ ...cellStyle(), color: row.l > 0 ? '#dc2626' : '#9ca3af', fontWeight: 700 }}>{row.l}</td>
                <td style={{ ...cellStyle(), color: '#6b7280', fontWeight: 500 }}>{row.gf}</td>
                <td style={{ ...cellStyle(), color: '#6b7280', fontWeight: 500 }}>{row.ga}</td>
                <td style={{ ...cellStyle(), color: row.gd > 0 ? '#16a34a' : row.gd < 0 ? '#dc2626' : '#9ca3af', fontWeight: 600 }}>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td style={{ ...cellStyle(), fontWeight: 900, fontSize: '15px', color: '#111827' }}>{row.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ padding: '12px 24px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
          P = Played &nbsp;·&nbsp; W = Won &nbsp;·&nbsp; D = Draw &nbsp;·&nbsp; L = Lost &nbsp;·&nbsp; GF = Goals For &nbsp;·&nbsp; GA = Goals Against &nbsp;·&nbsp; GD = Goal Difference &nbsp;·&nbsp; PTS = Points
        </p>
      </div>
    </div>
  )
}

function ResultsTable({ completed }: { completed: Game[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      <div style={{ padding: "24px 24px 0 24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Results</h2>
      </div>
      <div>
        {completed.map((g, idx) => {
          const homeWon = (g.home_score ?? 0) > (g.away_score ?? 0)
          const awayWon = (g.away_score ?? 0) > (g.home_score ?? 0)
          return (
            <div
              key={g.id}
              style={{ borderBottom: idx < completed.length - 1 ? '1px solid #f3f4f6' : 'none', padding: '16px 24px' }}
            >
              <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>
                {formatDate(g.game_date, g.game_time)}{g.field ? ` · ${g.field}` : ''}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Home */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, opacity: homeWon ? 1 : 0.5 }}>
                  <FlagImg emoji={g.home_flag} size={22} name={g.home_team} />
                  <span style={{ fontSize: '14px', fontWeight: homeWon ? 700 : 500, color: homeWon ? '#111827' : '#6b7280' }}>
                    {g.home_team}
                  </span>
                </div>
                {/* Score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', padding: '6px 14px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: homeWon ? '#111827' : '#9ca3af', minWidth: '20px', textAlign: 'center' }}>
                    {g.home_score}
                  </span>
                  <span style={{ color: '#d1d5db', fontSize: '14px' }}>–</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: awayWon ? '#111827' : '#9ca3af', minWidth: '20px', textAlign: 'center' }}>
                    {g.away_score}
                  </span>
                </div>
                {/* Away */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end', opacity: awayWon ? 1 : 0.5 }}>
                  <span style={{ fontSize: '14px', fontWeight: awayWon ? 700 : 500, color: awayWon ? '#111827' : '#6b7280' }}>
                    {g.away_team}
                  </span>
                  <FlagImg emoji={g.away_flag} size={22} name={g.away_team} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
