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

function flagEmojiToCode(emoji: string): string {
  if (!emoji) return ''
  try {
    const codePoints = Array.from(emoji).map(c => c.codePointAt(0)! - 0x1F1E6)
    if (codePoints.length < 2 || codePoints[0] < 0 || codePoints[1] < 0) return ''
    return String.fromCharCode(65 + codePoints[0], 65 + codePoints[1]).toLowerCase()
  } catch { return '' }
}

function FlagImg({ emoji, size = 22 }: { emoji: string; size?: number }) {
  const code = flagEmojiToCode(emoji)
  if (!code) return null
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={code.toUpperCase()}
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
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      {/* Header — tricolor stripe + navy body */}
      <header className="shadow-lg">
        <div style={{ display: 'flex', height: '7px' }}>
          <div style={{ flex: 1, background: '#0033A0' }} />
          <div style={{ flex: 1, background: '#006847' }} />
          <div style={{ flex: 1, background: '#D80027' }} />
        </div>
        <div style={{ background: '#ffffff' }} className="px-4 py-5">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="text-3xl">⚽</div>
            <div>
              <h1 className="font-bold text-xl leading-tight" style={{ color: '#0A1628' }}>Rogers Youth Soccer</h1>
              <p style={{ color: '#0033A0' }} className="text-sm font-medium tracking-wide">
                Spring 2026
              </p>
            </div>
            <div className="ml-auto text-right hidden sm:block">
              <p className="text-xs font-medium" style={{ color: '#0A1628' }}>Rogers Activity Center</p>
            </div>
          </div>
        </div>
      </header>
      <div style={{ background: '#C8A84B', height: '3px' }} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Division Tabs */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Division</p>
          <div className="flex gap-2 flex-wrap">
            {DIVISIONS.map(d => (
              <button
                key={d.slug}
                onClick={() => setActiveDiv(d.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  activeDiv === d.slug
                    ? 'text-white border-transparent shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
                style={activeDiv === d.slug ? { background: '#007A87', borderColor: '#007A87' } : {}}
              >
                {d.display_name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : (
          <div className="space-y-6">
            <StandingsTable standings={standings} />
            {completed.length > 0 && <ResultsTable completed={completed} />}
          </div>
        )}
      </div>

      <footer style={{ background: '#D80027' }} className="mt-12 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-white text-sm font-medium">Rogers Activity Center · Spring 2026</p>
          <p className="text-red-200 text-xs mt-1">For questions contact Rogers Parks &amp; Recreation</p>
        </div>
      </footer>
    </div>
  )
}

function StandingsTable({ standings }: { standings: StandingsRow[] }) {
  if (standings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
        <div className="text-4xl mb-3">⚽</div>
        <p className="text-gray-500 font-medium">No results recorded yet</p>
        <p className="text-gray-400 text-sm mt-1">Standings will appear once games are played</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      {/* Table header bar */}
      <div className="px-6 py-4 border-b border-gray-200" style={{ background: '#0033A0' }}>
        <h2 className="text-white font-bold text-sm tracking-widest uppercase">Standings</h2>
        <p className="text-blue-200 text-xs mt-0.5">Win 3 pts · Draw 1 pt · Loss 0 pts</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
              <th className="text-left py-4 pl-6 pr-2 text-xs font-bold text-gray-400 uppercase tracking-wider" style={{ width: '52px' }}>#</th>
              <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Team</th>
              <th className="text-center py-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider" style={{ width: '72px' }}>P</th>
              <th className="text-center py-4 px-2 text-xs font-bold uppercase tracking-wider" style={{ width: '72px', color: '#16a34a' }}>W</th>
              <th className="text-center py-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider" style={{ width: '72px' }}>D</th>
              <th className="text-center py-4 px-2 text-xs font-bold uppercase tracking-wider" style={{ width: '72px', color: '#dc2626' }}>L</th>
              <th className="text-center py-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider" style={{ width: '72px' }}>GF</th>
              <th className="text-center py-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider" style={{ width: '72px' }}>GA</th>
              <th className="text-center py-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider" style={{ width: '80px' }}>GD</th>
              <th className="text-center py-4 pl-2 pr-6 text-xs font-bold uppercase tracking-wider" style={{ width: '80px', color: '#007A87' }}>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr
                key={row.team}
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  background: i === 0 ? '#f0fdf4' : 'white',
                }}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="py-5 text-sm font-semibold text-gray-400" style={{ textAlign: 'center', width: '52px' }}>{i + 1}</td>
                <td className="py-5 px-4">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FlagImg emoji={row.flag} size={26} />
                    <span className="font-semibold text-gray-800">{row.team}</span>
                  </div>
                </td>
                <td className="py-5 px-2 text-center text-sm text-gray-600 font-medium">{row.gp}</td>
                <td className="py-5 px-2 text-center text-sm font-bold" style={{ color: '#16a34a' }}>{row.w}</td>
                <td className="py-5 px-2 text-center text-sm text-gray-500 font-medium">{row.d}</td>
                <td className="py-5 px-2 text-center text-sm font-bold" style={{ color: row.l > 0 ? '#dc2626' : '#9ca3af' }}>{row.l}</td>
                <td className="py-5 px-2 text-center text-sm text-gray-600 font-medium">{row.gf}</td>
                <td className="py-5 px-2 text-center text-sm text-gray-600 font-medium">{row.ga}</td>
                <td className={`py-5 px-2 text-center text-sm font-semibold ${row.gd > 0 ? 'text-green-600' : row.gd < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td className="py-5 pl-2 pr-6 text-center">
                  <span className="text-base font-black" style={{ color: '#0A1628' }}>{row.pts}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-gray-100" style={{ background: '#f8fafc' }}>
        <p className="text-xs text-gray-400 text-center">
          P = Played &nbsp;·&nbsp; W = Won &nbsp;·&nbsp; D = Draw &nbsp;·&nbsp; L = Lost &nbsp;·&nbsp; GF = Goals For &nbsp;·&nbsp; GA = Goals Against &nbsp;·&nbsp; GD = Goal Difference &nbsp;·&nbsp; PTS = Points
        </p>
      </div>
    </div>
  )
}

function ResultsTable({ completed }: { completed: Game[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200" style={{ background: '#006847' }}>
        <h2 className="text-white font-bold text-sm tracking-widest uppercase">Results</h2>
      </div>
      <div>
        {completed.map(g => {
          const homeWon = (g.home_score ?? 0) > (g.away_score ?? 0)
          const awayWon = (g.away_score ?? 0) > (g.home_score ?? 0)
          return (
            <div key={g.id} className="px-6 py-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
              <p className="text-xs text-gray-400 mb-2">
                {formatDate(g.game_date, g.game_time)}{g.field ? ` · ${g.field}` : ''}
              </p>
              <div className="flex items-center gap-4">
                {/* Home team */}
                <div className={`flex items-center gap-2 flex-1 ${homeWon ? '' : 'opacity-60'}`}>
                  <FlagImg emoji={g.home_flag} size={20} />
                  <span className={`text-sm ${homeWon ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                    {g.home_team}
                  </span>
                </div>
                {/* Score */}
                <div className="flex items-center gap-2 shrink-0 px-3 py-1 rounded-lg" style={{ background: '#f1f5f9' }}>
                  <span className={`text-lg font-black w-6 text-center ${homeWon ? 'text-gray-900' : 'text-gray-400'}`}>
                    {g.home_score}
                  </span>
                  <span className="text-gray-300 text-sm">–</span>
                  <span className={`text-lg font-black w-6 text-center ${awayWon ? 'text-gray-900' : 'text-gray-400'}`}>
                    {g.away_score}
                  </span>
                </div>
                {/* Away team */}
                <div className={`flex items-center gap-2 flex-1 justify-end ${awayWon ? '' : 'opacity-60'}`}>
                  <span className={`text-sm ${awayWon ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                    {g.away_team}
                  </span>
                  <FlagImg emoji={g.away_flag} size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
