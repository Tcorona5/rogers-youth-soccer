'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

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
  'England': 'gb-eng', 'Scotland': 'gb-sct', 'Wales': 'gb-wls',
}

function FlagImg({ emoji, name = '', size = 22 }: { emoji: string; name?: string; size?: number }) {
  const overrideKey = Object.keys(NAME_FLAG_OVERRIDES).find(k => name.includes(k))
  const code = (overrideKey ? NAME_FLAG_OVERRIDES[overrideKey] : null) || flagEmojiToCode(emoji)
  if (!code) return null
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={name || code}
      width={size}
      height={Math.round(size * 0.67)}
      style={{ objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
    />
  )
}

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
  home_flag: string
  away_flag: string
}

export default function PlayoffsPage() {
  const [activeDiv, setActiveDiv] = useState('u9b')
  const [games, setGames] = useState<PlayoffGame[]>([])
  const [loading, setLoading] = useState(true)

  // Load flag map once from regular season games
  useEffect(() => {
    const loadFlags = async () => {
      const { data } = await supabase
        .from('games')
        .select('home_team, home_flag, away_team, away_flag')
        .limit(1000)
      if (data) {
        const map: Record<string, string> = {}
        for (const g of data) {
          if (g.home_team && g.home_flag) map[g.home_team.trim()] = g.home_flag
          if (g.away_team && g.away_flag) map[g.away_team.trim()] = g.away_flag
        }
        setFlagMap(map)
      }
    }
    loadFlags()
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('playoff_games')
        .select('*')
        .eq('division_slug', activeDiv)
        .order('game_number', { ascending: true })
      setGames(data || [])
      setLoading(false)
    }
    load()
  }, [activeDiv])

  const grouped: Record<string, PlayoffGame[]> = {}
  for (const g of games) {
    if (!grouped[g.round]) grouped[g.round] = []
    grouped[g.round].push(g)
  }
  const sortedRounds = ROUND_ORDER.filter(r => grouped[r])

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{ background: ROGERS_GREEN, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '12px 20px 16px 20px' }}>
          <img src="/Logo_White.png" alt="Rogers Parks & Recreation" style={{ height: '52px', width: 'auto', display: 'block', marginBottom: '10px' }} />
          <h1 style={{ color: 'white', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            Rogers Youth Soccer &nbsp;·&nbsp; Spring 2026 &nbsp;·&nbsp; Rogers Activity Center
          </h1>
          <p style={{ color: 'white', fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>🌍 World Cup Season</p>
        </div>
      </header>

      {/* Nav tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <a href="/" style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500, color: '#6b7280', textDecoration: 'none', borderBottom: '2px solid transparent' }}>
            Standings &amp; Results
          </a>
          <a href="/playoffs" style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, color: ROGERS_GREEN, textDecoration: 'none', borderBottom: `2px solid ${ROGERS_GREEN}` }}>
            🏆 Playoffs
          </a>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>🏆 Spring 2026 Playoffs</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Single elimination · All divisions · Bracket updates live as games are played</p>
        </div>

        {/* Disclaimer */}
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '20px 24px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', margin: 0 }}>Playoff Schedule — Dates &amp; Times Only</p>
              <p style={{ fontSize: '13px', color: '#92400e', marginTop: '4px', lineHeight: 1.6 }}>
                The matchups below show scheduled dates, times, and fields for each round.
                <strong> Team assignments are not finalized until after the last regular season game.</strong> Please do not use this page to determine when your team plays — check back after the regular season ends.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #fcd34d', paddingTop: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#78350f', margin: '0 0 12px 0' }}>⏱️ Overtime &amp; Tiebreaker Rules</p>
            <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 10px 0', lineHeight: 1.6, fontStyle: 'italic' }}>
              If a playoff match is tied at the end of regulation, the following tiebreaker procedure will apply:
            </p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#78350f', margin: '0 0 4px 0' }}>Overtime — Golden Goal Format</p>
            <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 8px 0', lineHeight: 1.6 }}>
              Two five-minute overtime periods will be played. The golden goal rule is in effect, meaning the first team to score immediately wins the match. If no goal is scored after both overtime periods, the match proceeds to penalty kicks.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid #fcd34d', borderRadius: '6px', padding: '8px 12px', marginBottom: '14px' }}>
              <p style={{ fontSize: '12px', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
                💡 <em>What is a golden goal? It&apos;s sudden death. The first team to score wins instantly, no matter how much time is left.</em>
              </p>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#78350f', margin: '0 0 4px 0' }}>Penalty Kicks</p>
            <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 8px 0', lineHeight: 1.6 }}>
              Each team selects five players to attempt a penalty kick from the penalty spot. A coin toss determines which team kicks first. After all five kicks, the team with the most goals wins. If still tied, kicks continue one at a time, alternating teams, until one team scores and the other does not on the same round. No player may take a second kick until every eligible player on their roster has taken one.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid #fcd34d', borderRadius: '6px', padding: '8px 12px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
                💡 <em>What are penalty kicks? Each player takes a one-on-one kick against the goalkeeper from close range. It&apos;s the fairest way to decide a tied match.</em>
              </p>
            </div>
            <div style={{ borderTop: '1px solid #fcd34d', paddingTop: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#78350f', margin: '0 0 10px 0' }}>🤝 Sportsmanship &amp; Conduct</p>
              <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 8px 0', lineHeight: 1.6 }}>
                The Rogers Youth Soccer playoffs are a celebration of what our players have accomplished this season. We ask that all players, coaches, and spectators continue to model the same positive behavior expected throughout the regular season. Cheer loudly, compete hard, and win or lose with grace.
              </p>
              <p style={{ fontSize: '13px', color: '#92400e', margin: 0, lineHeight: 1.6 }}>
                Verbal abuse, aggressive behavior, or unsportsmanlike conduct directed at players, coaches, referees, or opposing families will not be tolerated under any circumstances. Any individual who violates this standard will be asked to leave the facility immediately. Let&apos;s make this a playoff experience our kids will remember for all the right reasons.
              </p>
            </div>
          </div>
        </div>

        {/* Division tabs */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {DIVISIONS.map(d => (
            <button
              key={d.slug}
              onClick={() => setActiveDiv(d.slug)}
              style={{
                padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                border: activeDiv === d.slug ? 'none' : '1px solid #d1d5db',
                background: activeDiv === d.slug ? ROGERS_GREEN : 'white',
                color: activeDiv === d.slug ? 'white' : '#374151',
                boxShadow: activeDiv === d.slug ? '0 2px 6px rgba(45,122,58,0.3)' : 'none',
              }}
            >{d.name}</button>
          ))}
        </div>

        {/* Bracket */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading bracket…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sortedRounds.map(round => {
              const color = ROUND_COLORS[round] || ROGERS_GREEN
              const isChampionship = round === 'Championship'
              return (
                <div key={round} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  {/* Round header */}
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isChampionship ? '#fff7ed' : '#fafafa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: color, color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {round}
                      </span>
                      {isChampionship && <span style={{ fontSize: '16px' }}>🏆</span>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0 }}>
                        {grouped[round][0]?.game_date}
                      </p>
                      {grouped[round][0]?.location && (
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, marginTop: '2px' }}>
                          {grouped[round][0].location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Games */}
                  {grouped[round].map((game, gi) => {
                    const homeKnown = !!game.home_team
                    const awayKnown = !!game.away_team
                    const isPlayed = !!game.winner

                    return (
                      <div
                        key={game.id}
                        style={{
                          padding: '14px 20px',
                          borderBottom: gi < grouped[round].length - 1 ? '1px solid #f3f4f6' : 'none',
                          background: isPlayed ? '#f9fafb' : 'white',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: color, background: `${color}15`, border: `1px solid ${color}40`, padding: '2px 8px', borderRadius: '10px' }}>
                              #{game.game_number}
                            </span>
                            {game.game_time && <span style={{ fontSize: '12px', color: '#9ca3af' }}>{game.game_time}</span>}
                            {game.field && (
                              <span style={{ fontSize: '11px', fontWeight: 600, color: 'white', background: color, padding: '1px 7px', borderRadius: '10px' }}>
                                {game.field}
                              </span>
                            )}
                          </div>
                          {isPlayed && (
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>
                              ✓ {game.winner} advances
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                          {/* Home */}
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <span style={{
                              fontSize: '15px',
                              fontWeight: isPlayed && game.winner === game.home_team ? 700 : 500,
                              color: isPlayed ? (game.winner === game.home_team ? '#111827' : '#9ca3af') : (homeKnown ? '#111827' : '#d1d5db'),
                              fontStyle: homeKnown ? 'normal' : 'italic',
                            }}>
                              {homeKnown ? game.home_team : 'TBD'}
                            </span>
                            {homeKnown && <FlagImg emoji={game.home_flag || ''} name={game.home_team} size={22} />}
                          </div>

                          {/* VS divider */}
                          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px' }}>
                            <span style={{ fontSize: '13px', color: '#d1d5db', fontWeight: 300 }}>vs</span>
                          </div>

                          {/* Away */}
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {awayKnown && <FlagImg emoji={game.away_flag || ''} name={game.away_team} size={22} />}
                            <span style={{
                              fontSize: '15px',
                              fontWeight: isPlayed && game.winner === game.away_team ? 700 : 500,
                              color: isPlayed ? (game.winner === game.away_team ? '#111827' : '#9ca3af') : (awayKnown ? '#111827' : '#d1d5db'),
                              fontStyle: awayKnown ? 'normal' : 'italic',
                            }}>
                              {awayKnown ? game.away_team : 'TBD'}
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

      {/* Footer */}
      <footer style={{ background: ROGERS_GREEN, marginTop: '48px', padding: '20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', margin: 0 }}>Rogers Activity Center · Spring 2026</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '4px' }}>For questions contact Rogers Parks &amp; Recreation</p>
        </div>
      </footer>
    </div>
  )
}
