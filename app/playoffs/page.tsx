'use client'
import { useState } from 'react'

const ROGERS_GREEN = '#2D7A3A'

const DIVISIONS = [
  'U9 Boys', 'U9 Girls', 'U11 Boys', 'U11 Girls',
  '6th Grade Boys', 'JV Boys', 'JV Girls',
  'Varsity Boys', 'Varsity Girls', 'U18 Coed',
]

type Game = {
  matchup: string
  time?: string
  field?: string
  date?: string
  location?: string
  note?: string
}

type Round = {
  round: string
  date: string
  location?: string
  games: Game[]
}

type DivisionSchedule = {
  division: string
  rounds: Round[]
}

const PLAYOFF_DATA: DivisionSchedule[] = [
  {
    division: 'U9 Girls',
    rounds: [
      {
        round: 'Quarterfinals', date: 'May 9, 2026', location: 'Veterans Park',
        games: [
          { matchup: 'Seed 1 vs Seed 8', time: '9:00 AM',  field: 'V2B' },
          { matchup: 'Seed 4 vs Seed 5', time: '10:30 AM', field: 'V2B' },
          { matchup: 'Seed 3 vs Seed 6', time: '12:00 PM', field: 'V2B' },
          { matchup: 'Seed 2 vs Seed 7', time: '1:30 PM',  field: 'V2B' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 14, 2026', location: 'Veterans Park',
        games: [
          { matchup: 'TBD vs TBD', time: '6:00 PM', field: 'V2A' },
          { matchup: 'TBD vs TBD', time: '7:30 PM', field: 'V2A' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'TBD vs TBD', time: '9:00 AM', field: 'H3' },
        ],
      },
    ],
  },
  {
    division: 'U9 Boys',
    rounds: [
      {
        round: 'First Round', date: 'May 4–5, 2026', location: 'Veterans Park',
        games: [
          { matchup: 'Seed 8 vs Seed 9',  date: 'May 4', time: '6:00 PM',  field: 'V2A' },
          { matchup: 'Seed 1',            note: 'Bye' },
          { matchup: 'Seed 4 vs Seed 13', date: 'May 5', time: '6:00 PM',  field: 'V2A' },
          { matchup: 'Seed 5 vs Seed 12', date: 'May 5', time: '7:30 PM',  field: 'V2A' },
          { matchup: 'Seed 7 vs Seed 10', date: 'May 4', time: '7:30 PM',  field: 'V2A' },
          { matchup: 'Seed 2',            note: 'Bye' },
          { matchup: 'Seed 3 vs Seed 14', date: 'May 5', time: '6:00 PM',  field: 'V2B' },
          { matchup: 'Seed 6 vs Seed 11', date: 'May 5', time: '7:30 PM',  field: 'V2B' },
        ],
      },
      {
        round: 'Quarterfinals', date: 'May 9, 2026', location: 'Veterans Park',
        games: [
          { matchup: 'Seed 1 vs Winner R1', time: '9:00 AM',  field: 'V2A' },
          { matchup: 'TBD vs TBD',          time: '10:30 AM', field: 'V2A' },
          { matchup: 'Seed 2 vs Winner R1', time: '12:00 PM', field: 'V2A' },
          { matchup: 'TBD vs TBD',          time: '1:30 PM',  field: 'V2A' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 12, 2026', location: 'Veterans Park',
        games: [
          { matchup: 'TBD vs TBD', time: '6:00 PM', field: 'V2A' },
          { matchup: 'TBD vs TBD', time: '7:30 PM', field: 'V2A' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'TBD vs TBD', time: '10:30 AM', field: 'H3' },
        ],
      },
    ],
  },
  {
    division: 'U11 Girls',
    rounds: [
      {
        round: 'Play-in', date: 'May 5, 2026', location: 'Veterans Park',
        games: [
          { matchup: 'Seed 8 vs Seed 9', time: '6:00 PM', field: 'V1A' },
        ],
      },
      {
        round: 'Quarterfinals', date: 'May 9, 2026',
        games: [
          { matchup: 'Seed 1 vs Play-in Winner', time: '9:00 AM',  location: 'Hebron Park',   field: 'H1N' },
          { matchup: 'Seed 4 vs Seed 5',         time: '9:00 AM',  location: 'Veterans Park', field: 'V1A' },
          { matchup: 'Seed 2 vs Seed 7',         time: '10:30 AM', location: 'Hebron Park',   field: 'H1N' },
          { matchup: 'Seed 3 vs Seed 6',         time: '10:30 AM', location: 'Veterans Park', field: 'V1A' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 12, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'TBD vs TBD', time: '6:00 PM', field: 'H1N' },
          { matchup: 'TBD vs TBD', time: '7:30 PM', field: 'H1N' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'TBD vs TBD', time: '10:00 AM', field: 'H1S' },
        ],
      },
    ],
  },
  {
    division: 'U11 Boys',
    rounds: [
      {
        round: 'First Round', date: 'May 5, 2026',
        games: [
          { matchup: 'Seed 8 vs Seed 9',  time: '7:30 PM', location: 'Veterans Park', field: 'V1B' },
          { matchup: 'Seed 1',            note: 'Bye' },
          { matchup: 'Seed 4 vs Seed 13', time: '6:00 PM', location: 'Hebron Park',   field: 'H1S' },
          { matchup: 'Seed 5 vs Seed 12', time: '7:30 PM', location: 'Hebron Park',   field: 'H1S' },
          { matchup: 'Seed 7 vs Seed 10', time: '6:00 PM', location: 'Veterans Park', field: 'V1A' },
          { matchup: 'Seed 2',            note: 'Bye' },
          { matchup: 'Seed 3',            note: 'Bye' },
          { matchup: 'Seed 6 vs Seed 11', time: '7:30 PM', location: 'Veterans Park', field: 'V1A' },
        ],
      },
      {
        round: 'Quarterfinals', date: 'May 9, 2026',
        games: [
          { matchup: 'Seed 1 vs Winner R1', time: '12:00 PM', location: 'Hebron Park',   field: 'H1N' },
          { matchup: 'TBD vs TBD',          time: '12:00 PM', location: 'Veterans Park', field: 'V1A' },
          { matchup: 'Seed 2 vs Winner R1', time: '1:30 PM',  location: 'Hebron Park',   field: 'H1N' },
          { matchup: 'Seed 3 vs Winner R1', time: '1:30 PM',  location: 'Veterans Park', field: 'V1A' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 12, 2026', location: 'Veterans Park',
        games: [
          { matchup: 'TBD vs TBD', time: '6:00 PM', field: 'V1A' },
          { matchup: 'TBD vs TBD', time: '7:30 PM', field: 'V1A' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'TBD vs TBD', time: '9:30 AM', field: 'H1N' },
        ],
      },
    ],
  },
  {
    division: '6th Grade Boys',
    rounds: [
      {
        round: 'Play-in', date: 'May 9, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'Seed 4 vs Seed 5', time: '9:00 AM', field: 'H1S' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 12, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'Seed 1 vs Play-in Winner', time: '6:00 PM', field: 'H1S' },
          { matchup: 'Seed 2 vs Seed 3',         time: '7:30 PM', field: 'H1S' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'TBD vs TBD', time: '11:00 AM', field: 'H1N' },
        ],
      },
    ],
  },
  {
    division: 'JV Girls',
    rounds: [
      {
        round: 'First Round', date: 'May 9, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'Seed 4 vs Seed 5', time: '10:30 AM', field: 'H1S' },
          { matchup: 'Seed 3 vs Seed 6', time: '12:00 PM', field: 'H1S' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 14, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'Seed 1 vs Winner R1', time: '6:00 PM', field: 'H1N' },
          { matchup: 'Seed 2 vs Winner R1', time: '7:30 PM', field: 'H1N' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'TBD vs TBD', time: '11:30 AM', field: 'H1S' },
        ],
      },
    ],
  },
  {
    division: 'JV Boys',
    rounds: [
      {
        round: 'First Round', date: 'May 9, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'Seed 4 vs Seed 5', time: '1:30 PM', field: 'H1S' },
          { matchup: 'Seed 3 vs Seed 6', time: '3:00 PM', field: 'H1S' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 12, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'Seed 1 vs Winner R1', time: '6:00 PM', field: 'H1N' },
          { matchup: 'Seed 2 vs Winner R1', time: '7:30 PM', field: 'H1N' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'TBD vs TBD', time: '12:30 PM', field: 'H1N' },
        ],
      },
    ],
  },
  {
    division: 'Varsity Girls',
    rounds: [
      {
        round: 'Semifinals', date: 'May 9, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'Seed 3 vs Seed 2', time: '9:00 AM',  field: 'H2' },
          { matchup: 'Seed 4 vs Seed 1', time: '11:00 AM', field: 'H2' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { matchup: 'TBD vs TBD', time: '9:00 AM', field: 'H2' },
        ],
      },
    ],
  },
  {
    division: 'Varsity Boys',
    rounds: [
      {
        round: 'Semifinals', date: 'May 12, 2026', location: 'Field 2',
        games: [
          { matchup: 'Seed 3 vs Seed 2', time: '6:00 PM', field: 'Field 2' },
          { matchup: 'Seed 4 vs Seed 1', time: '7:45 PM', field: 'Field 2' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Field 2',
        games: [
          { matchup: 'TBD vs TBD', time: '11:00 AM', field: 'Field 2' },
        ],
      },
    ],
  },
  {
    division: 'U18 Coed',
    rounds: [
      {
        round: 'Semifinals', date: 'May 11, 2026', location: 'Field 2',
        games: [
          { matchup: 'Seed 3 vs Seed 2', time: '6:00 PM', field: 'Field 2' },
          { matchup: 'Seed 4 vs Seed 1', time: '8:00 PM', field: 'Field 2' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Field 2',
        games: [
          { matchup: 'TBD vs TBD', time: '1:00 PM', field: 'Field 2' },
        ],
      },
    ],
  },
]

const ROUND_COLORS: Record<string, string> = {
  'Play-in':      '#7c3aed',
  'First Round':  '#0369a1',
  'Quarterfinals':'#0369a1',
  'Semifinals':   '#d97706',
  'Championship': '#dc2626',
}

export default function PlayoffsPage() {
  const [activeDiv, setActiveDiv] = useState('U9 Boys')

  const divData = PLAYOFF_DATA.find(d => d.division === activeDiv)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{ background: ROGERS_GREEN, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '12px 20px 16px 20px' }}>
          <img src="/Logo_White.png" alt="Rogers Parks & Recreation" style={{ height: '52px', width: 'auto', display: 'block', marginBottom: '10px' }} />
          <h1 style={{ color: 'white', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            Rogers Youth Soccer &nbsp;·&nbsp; Spring 2026 &nbsp;·&nbsp; Rogers Activity Center
          </h1>
          <p style={{ color: 'white', fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
            🌍 World Cup Season
          </p>
        </div>
      </header>

      {/* Nav tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <a href="/" style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500, color: '#6b7280', textDecoration: 'none', borderBottom: '2px solid transparent' }}>
            Standings &amp; Results
          </a>
          <a href="/playoffs" style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, color: ROGERS_GREEN, textDecoration: 'none', borderBottom: `2px solid ${ROGERS_GREEN}` }}>
            Playoffs
          </a>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Page title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>🏆 Spring 2026 Playoffs</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Single elimination · All divisions</p>
        </div>

        {/* Disclaimer banner */}
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '14px 18px', marginBottom: '28px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', margin: 0 }}>Playoff Schedule — Dates &amp; Times Only</p>
            <p style={{ fontSize: '13px', color: '#92400e', marginTop: '4px', lineHeight: 1.5 }}>
              The matchups listed below show the scheduled dates, times, and fields for each round. 
              <strong> Team assignments are not finalized until after the last regular season game.</strong> Games listed as "TBD vs TBD" will be updated once seeding is confirmed. Please do not use this page to determine when your team plays — check back after the regular season ends.
            </p>
          </div>
        </div>

        {/* Division tabs */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DIVISIONS.map(d => (
              <button
                key={d}
                onClick={() => setActiveDiv(d)}
                style={{
                  padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  border: activeDiv === d ? 'none' : '1px solid #d1d5db',
                  background: activeDiv === d ? ROGERS_GREEN : 'white',
                  color: activeDiv === d ? 'white' : '#374151',
                  boxShadow: activeDiv === d ? '0 2px 6px rgba(45,122,58,0.3)' : 'none',
                }}
              >{d}</button>
            ))}
          </div>
        </div>

        {/* Rounds */}
        {divData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {divData.rounds.map((round, ri) => {
              const color = ROUND_COLORS[round.round] || ROGERS_GREEN
              const isChampionship = round.round === 'Championship'
              return (
                <div key={ri} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  {/* Round header */}
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isChampionship ? '#fff7ed' : 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: color, color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {round.round}
                      </span>
                      {isChampionship && <span style={{ fontSize: '16px' }}>🏆</span>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0 }}>{round.date}</p>
                      {round.location && <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, marginTop: '2px' }}>{round.location}</p>}
                    </div>
                  </div>

                  {/* Games */}
                  <div>
                    {round.games.map((game, gi) => {
                      const isBye = !!game.note
                      const isTBD = game.matchup === 'TBD vs TBD'
                      return (
                        <div
                          key={gi}
                          style={{
                            padding: '14px 20px',
                            borderBottom: gi < round.games.length - 1 ? '1px solid #f9fafb' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: isBye ? '#f9fafb' : 'white',
                            opacity: isBye ? 0.6 : 1,
                          }}
                        >
                          {/* Matchup */}
                          <div style={{ flex: 1 }}>
                            {isBye ? (
                              <p style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
                                {game.matchup} — Bye
                              </p>
                            ) : isTBD ? (
                              <p style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
                                TBD vs TBD
                              </p>
                            ) : (
                              <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                                {game.matchup}
                              </p>
                            )}
                          </div>

                          {/* Time / field / location */}
                          {!isBye && (
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              {game.date && <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{game.date}</p>}
                              {game.time && <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0 }}>{game.time}</p>}
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
                                {game.location && <span style={{ fontSize: '11px', color: '#9ca3af' }}>{game.location}</span>}
                                {game.field && (
                                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'white', background: color, padding: '1px 7px', borderRadius: '10px' }}>
                                    {game.field}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No playoff data found for this division.</div>
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
