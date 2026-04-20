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
      {/* Header — USA blue / Mexico green / Canada red tricolor stripes + navy body */}
      <header className="shadow-lg">
        <div style={{ display: 'flex', height: '7px' }}>
          <div style={{ flex: 1, background: '#0033A0' }} />
          <div style={{ flex: 1, background: '#006847' }} />
          <div style={{ flex: 1, background: '#D80027' }} />
        </div>
        <div style={{ background: '#0A1628' }} className="px-4 py-5">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="text-3xl">⚽</div>
            <div>
              <h1 className="text-white font-bold text-xl leading-tight">Rogers Youth Soccer</h1>
              <p style={{ color: '#C8A84B' }} className="text-sm font-medium tracking-wide">
                🌍 Spring 2026 · World Cup Season
              </p>
            </div>
            <div className="ml-auto text-right hidden sm:block">
              <p className="text-gray-400 text-xs">Rogers Community-School</p>
              <p className="text-gray-400 text-xs">Recreation Association</p>
            </div>
          </div>
        </div>
      </header>

      {/* Gold accent bar */}
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
            <StandingsView standings={standings} />
            {completed.length > 0 && <ResultsView completed={completed} />}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: '#0A1628' }} className="mt-12 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            Rogers Community-School Recreation Association · Spring 2026
          </p>
          <p className="text-gray-500 text-xs mt-1">
            For questions contact Rogers Parks &amp; Recreation
          </p>
        </div>
      </footer>
    </div>
  )
}

function StandingsView({ standings }: { standings: StandingsRow[] }) {
  if (standings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <div className="text-4xl mb-3">⚽</div>
        <p className="text-gray-500 font-medium">No results recorded yet</p>
        <p className="text-gray-400 text-sm mt-1">Standings will appear once games are played</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-gray-100" style={{ background: '#0A1628' }}>
        <h2 className="text-white font-semibold text-sm tracking-wide uppercase">Standings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold w-8">#</th>
              <th className="text-left px-4 py-3 font-semibold min-w-[140px]">Team</th>
              <th className="text-center px-4 py-3 font-semibold">GP</th>
              <th className="text-center px-4 py-3 font-semibold">W</th>
              <th className="text-center px-4 py-3 font-semibold">D</th>
              <th className="text-center px-4 py-3 font-semibold">L</th>
              <th className="text-center px-4 py-3 font-semibold">GF</th>
              <th className="text-center px-4 py-3 font-semibold">GA</th>
              <th className="text-center px-4 py-3 font-semibold">GD</th>
              <th className="text-center px-4 py-3 font-semibold" style={{ color: '#007A87' }}>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr key={row.team} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 font-medium text-xs">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {row.flag && <span className="text-lg">{row.flag}</span>}
                    <span className="font-semibold text-gray-800">{row.team}</span>
                  </div>
                </td>
                <td className="text-center px-4 py-3 text-gray-600">{row.gp}</td>
                <td className="text-center px-4 py-3 text-gray-600">{row.w}</td>
                <td className="text-center px-4 py-3 text-gray-600">{row.d}</td>
                <td className="text-center px-4 py-3 text-gray-600">{row.l}</td>
                <td className="text-center px-4 py-3 text-gray-600">{row.gf}</td>
                <td className="text-center px-4 py-3 text-gray-600">{row.ga}</td>
                <td className={`text-center px-4 py-3 font-medium ${row.gd > 0 ? 'text-green-600' : row.gd < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td className="text-center px-4 py-3 font-bold text-base" style={{ color: '#0A1628' }}>
                  {row.pts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Legend */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          GP = Games Played &nbsp;·&nbsp; W = Won &nbsp;·&nbsp; D = Draw &nbsp;·&nbsp; L = Lost &nbsp;·&nbsp; GF = Goals For &nbsp;·&nbsp; GA = Goals Against &nbsp;·&nbsp; GD = Goal Difference &nbsp;·&nbsp; PTS = Points
        </p>
      </div>
    </div>
  )
}

function ResultsView({ completed }: { completed: Game[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-gray-100" style={{ background: '#0A1628' }}>
        <h2 className="text-white font-semibold text-sm tracking-wide uppercase">Results</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {completed.map(g => {
          const homeWon = (g.home_score ?? 0) > (g.away_score ?? 0)
          const awayWon = (g.away_score ?? 0) > (g.home_score ?? 0)
          return (
            <div key={g.id} className="px-5 py-3">
              <div className="text-xs text-gray-400 mb-1">
                {formatDate(g.game_date, g.game_time)}{g.field ? ` · ${g.field}` : ''}
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 flex-1 ${homeWon ? 'opacity-100' : 'opacity-70'}`}>
                  <span className="text-xl">{g.home_flag}</span>
                  <span className={`text-sm ${homeWon ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                    {g.home_team}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xl font-black ${homeWon ? 'text-gray-900' : 'text-gray-500'}`}>
                    {g.home_score}
                  </span>
                  <span className="text-gray-300 font-light">–</span>
                  <span className={`text-xl font-black ${awayWon ? 'text-gray-900' : 'text-gray-500'}`}>
                    {g.away_score}
                  </span>
                </div>
                <div className={`flex items-center gap-2 flex-1 justify-end ${awayWon ? 'opacity-100' : 'opacity-70'}`}>
                  <span className={`text-sm ${awayWon ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                    {g.away_team}
                  </span>
                  <span className="text-xl">{g.away_flag}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
