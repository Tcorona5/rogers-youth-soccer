'use client'
import { useState } from 'react'

const ROGERS_GREEN = '#2D7A3A'

const DIVISIONS = [
  'U9 Boys', 'U9 Girls', 'U11 Boys', 'U11 Girls',
  '6th Grade Boys', 'JV Boys', 'JV Girls',
  'Varsity Boys', 'Varsity Girls', 'U18 Coed',
]

type Game = {
  gameNumber?: string
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
    division: 'U9 Boys',
    rounds: [
      {
        round: 'First Round', date: 'May 4–5, 2026', location: 'Veterans Park',
        games: [
          { gameNumber: '901', matchup: 'Seed 8 vs Seed 9',  date: 'May 4', time: '6:00 PM',  field: 'V2A' },
          { matchup: 'Seed 1', note: 'Bye' },
          { gameNumber: '903', matchup: 'Seed 4 vs Seed 13', date: 'May 5', time: '6:00 PM',  field: 'V2A' },
          { gameNumber: '905', matchup: 'Seed 5 vs Seed 12', date: 'May 5', time: '7:30 PM',  field: 'V2A' },
          { gameNumber: '907', matchup: 'Seed 7 vs Seed 10', date: 'May 4', time: '7:30 PM',  field: 'V2A' },
          { matchup: 'Seed 2', note: 'Bye' },
          { gameNumber: '909', matchup: 'Seed 3 vs Seed 14', date: 'May 5', time: '6:00 PM',  field: 'V2B' },
          { gameNumber: '911', matchup: 'Seed 6 vs Seed 11', date: 'May 5', time: '7:30 PM',  field: 'V2B' },
        ],
      },
      {
        round: 'Quarterfinals', date: 'May 9, 2026', location: 'Veterans Park',
        games: [
          { gameNumber: '913', matchup: 'Seed 1 vs Winner of Game 901', time: '9:00 AM',  field: 'V2A' },
          { gameNumber: '915', matchup: 'Winner of Game 903 vs Winner of Game 905', time: '10:30 AM', field: 'V2A' },
          { gameNumber: '917', matchup: 'Seed 2 vs Winner of Game 907', time: '12:00 PM', field: 'V2A' },
          { gameNumber: '919', matchup: 'Winner of Game 909 vs Winner of Game 911', time: '1:30 PM',  field: 'V2A' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 12, 2026', location: 'Veterans Park',
        games: [
          { gameNumber: '921', matchup: 'Winner of Game 913 vs Winner of Game 915', time: '6:00 PM', field: 'V2A' },
          { gameNumber: '923', matchup: 'Winner of Game 917 vs Winner of Game 919', time: '7:30 PM', field: 'V2A' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { gameNumber: '925', matchup: 'Winner of Game 921 vs Winner of Game 923', time: '10:30 AM', field: 'H3' },
        ],
      },
    ],
  },
  {
    division: 'U9 Girls',
    rounds: [
      {
        round: 'Quarterfinals', date: 'May 9, 2026', location: 'Veterans Park',
        games: [
          { gameNumber: '902', matchup: 'Seed 1 vs Seed 8', time: '9:00 AM',  field: 'V2B' },
          { gameNumber: '904', matchup: 'Seed 4 vs Seed 5', time: '10:30 AM', field: 'V2B' },
          { gameNumber: '906', matchup: 'Seed 3 vs Seed 6', time: '12:00 PM', field: 'V2B' },
          { gameNumber: '908', matchup: 'Seed 2 vs Seed 7', time: '1:30 PM',  field: 'V2B' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 14, 2026', location: 'Veterans Park',
        games: [
          { gameNumber: '910', matchup: 'Winner of Game 902 vs Winner of Game 904', time: '6:00 PM', field: 'V2A' },
          { gameNumber: '912', matchup: 'Winner of Game 906 vs Winner of Game 908', time: '7:30 PM', field: 'V2A' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { gameNumber: '914', matchup: 'Winner of Game 910 vs Winner of Game 912', time: '9:00 AM', field: 'H3' },
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
          { gameNumber: '1101', matchup: 'Seed 8 vs Seed 9',  time: '7:30 PM', location: 'Veterans Park', field: 'V1B' },
          { matchup: 'Seed 1', note: 'Bye' },
          { gameNumber: '1103', matchup: 'Seed 4 vs Seed 13', time: '6:00 PM', location: 'Hebron Park',   field: 'H1S' },
          { gameNumber: '1105', matchup: 'Seed 5 vs Seed 12', time: '7:30 PM', location: 'Hebron Park',   field: 'H1S' },
          { gameNumber: '1107', matchup: 'Seed 7 vs Seed 10', time: '6:00 PM', location: 'Veterans Park', field: 'V1A' },
          { matchup: 'Seed 2', note: 'Bye' },
          { matchup: 'Seed 3', note: 'Bye' },
          { gameNumber: '1109', matchup: 'Seed 6 vs Seed 11', time: '7:30 PM', location: 'Veterans Park', field: 'V1A' },
        ],
      },
      {
        round: 'Quarterfinals', date: 'May 9, 2026',
        games: [
          { gameNumber: '1111', matchup: 'Seed 1 vs Winner of Game 1101', time: '12:00 PM', location: 'Hebron Park',   field: 'H1N' },
          { gameNumber: '1113', matchup: 'Winner of Game 1103 vs Winner of Game 1105', time: '12:00 PM', location: 'Veterans Park', field: 'V1A' },
          { gameNumber: '1115', matchup: 'Seed 2 vs Winner of Game 1107', time: '1:30 PM',  location: 'Hebron Park',   field: 'H1N' },
          { gameNumber: '1117', matchup: 'Seed 3 vs Winner of Game 1109', time: '1:30 PM',  location: 'Veterans Park', field: 'V1A' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 12, 2026', location: 'Veterans Park',
        games: [
          { gameNumber: '1119', matchup: 'Winner of Game 1111 vs Winner of Game 1113', time: '6:00 PM', field: 'V1A' },
          { gameNumber: '1121', matchup: 'Winner of Game 1115 vs Winner of Game 1117', time: '7:30 PM', field: 'V1A' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { gameNumber: '1123', matchup: 'Winner of Game 1119 vs Winner of Game 1121', time: '9:30 AM', field: 'H1N' },
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
          { gameNumber: '1102', matchup: 'Seed 8 vs Seed 9', time: '6:00 PM', field: 'V1A' },
        ],
      },
      {
        round: 'Quarterfinals', date: 'May 9, 2026',
        games: [
          { gameNumber: '1104', matchup: 'Seed 1 vs Winner of Game 1102', time: '9:00 AM',  location: 'Hebron Park',   field: 'H1N' },
          { gameNumber: '1106', matchup: 'Seed 4 vs Seed 5',              time: '9:00 AM',  location: 'Veterans Park', field: 'V1A' },
          { gameNumber: '1108', matchup: 'Seed 2 vs Seed 7',              time: '10:30 AM', location: 'Hebron Park',   field: 'H1N' },
          { gameNumber: '1110', matchup: 'Seed 3 vs Seed 6',              time: '10:30 AM', location: 'Veterans Park', field: 'V1A' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 14, 2026', location: 'Hebron Park',
        games: [
          { gameNumber: '1112', matchup: 'Winner of Game 1104 vs Winner of Game 1106', time: '6:00 PM', field: 'H1S' },
          { gameNumber: '1114', matchup: 'Winner of Game 1108 vs Winner of Game 1110', time: '7:30 PM', field: 'H1S' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { gameNumber: '1116', matchup: 'Winner of Game 1112 vs Winner of Game 1114', time: '10:00 AM', field: 'H1S' },
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
          { gameNumber: '601', matchup: 'Seed 4 vs Seed 5', time: '9:00 AM', field: 'H1S' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 12, 2026', location: 'Hebron Park',
        games: [
          { gameNumber: '602', matchup: 'Seed 1 vs Winner of Game 601', time: '6:00 PM', field: 'H1S' },
          { gameNumber: '603', matchup: 'Seed 2 vs Seed 3',             time: '7:30 PM', field: 'H1S' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { gameNumber: '604', matchup: 'Winner of Game 602 vs Winner of Game 603', time: '11:00 AM', field: 'H1N' },
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
          { gameNumber: '101', matchup: 'Seed 4 vs Seed 5', time: '1:30 PM', field: 'H1S' },
          { gameNumber: '103', matchup: 'Seed 3 vs Seed 6', time: '3:00 PM', field: 'H1S' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 12, 2026', location: 'Hebron Park',
        games: [
          { gameNumber: '105', matchup: 'Seed 1 vs Winner of Game 101', time: '6:00 PM', field: 'H1N' },
          { gameNumber: '107', matchup: 'Seed 2 vs Winner of Game 103', time: '7:30 PM', field: 'H1N' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { gameNumber: '109', matchup: 'Winner of Game 105 vs Winner of Game 107', time: '12:30 PM', field: 'H1N' },
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
          { gameNumber: '201', matchup: 'Seed 4 vs Seed 5', time: '10:30 AM', field: 'H1S' },
          { gameNumber: '203', matchup: 'Seed 3 vs Seed 6', time: '12:00 PM', field: 'H1S' },
        ],
      },
      {
        round: 'Semifinals', date: 'May 14, 2026', location: 'Hebron Park',
        games: [
          { gameNumber: '205', matchup: 'Seed 1 vs Winner of Game 201', time: '6:00 PM', field: 'H1N' },
          { gameNumber: '207', matchup: 'Seed 2 vs Winner of Game 203', time: '7:30 PM', field: 'H1N' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { gameNumber: '209', matchup: 'Winner of Game 205 vs Winner of Game 207', time: '11:30 AM', field: 'H1S' },
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
          { gameNumber: '301', matchup: 'Seed 3 vs Seed 2', time: '6:00 PM', field: 'Field 2' },
          { gameNumber: '303', matchup: 'Seed 4 vs Seed 1', time: '7:45 PM', field: 'Field 2' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Field 2',
        games: [
          { gameNumber: '305', matchup: 'Winner of Game 301 vs Winner of Game 303', time: '11:00 AM', field: 'Field 2' },
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
          { gameNumber: '401', matchup: 'Seed 3 vs Seed 2', time: '9:00 AM',  field: 'H2' },
          { gameNumber: '403', matchup: 'Seed 4 vs Seed 1', time: '11:00 AM', field: 'H2' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Hebron Park',
        games: [
          { gameNumber: '405', matchup: 'Winner of Game 401 vs Winner of Game 403', time: '9:00 AM', field: 'H2' },
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
          { gameNumber: '501', matchup: 'Seed 3 vs Seed 2', time: '6:00 PM', field: 'Field 2' },
          { gameNumber: '503', matchup: 'Seed 4 vs Seed 1', time: '8:00 PM', field: 'Field 2' },
        ],
      },
      {
        round: 'Championship', date: 'May 16, 2026', location: 'Field 2',
        games: [
          { gameNumber: '505', matchup: 'Winner of Game 501 vs Winner of Game 503', time: '1:00 PM', field: 'Field 2' },
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
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Single elimination · All divisions</p>
        </div>

        {/* Disclaimer + Rules */}
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '20px 24px', marginBottom: '28px' }}>
          
          {/* Schedule notice */}
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

            {/* Overtime Rules */}
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#78350f', margin: '0 0 12px 0' }}>⏱️ Overtime &amp; Tiebreaker Rules</p>
            <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 10px 0', lineHeight: 1.6, fontStyle: 'italic' }}>
              If a playoff match is tied at the end of regulation, the following tiebreaker procedure will apply:
            </p>

            <p style={{ fontSize: '13px', fontWeight: 700, color: '#78350f', margin: '0 0 4px 0' }}>Overtime — Golden Goal Format</p>
            <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 8px 0', lineHeight: 1.6 }}>
              Two five-minute overtime periods will be played. The golden goal rule is in effect, meaning the first team to score immediately wins the match — play stops the moment a goal is scored. If no goal is scored after both overtime periods, the match proceeds to penalty kicks.
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

            {/* Sportsmanship */}
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

        {/* Rounds */}
        {divData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {divData.rounds.map((round, ri) => {
              const color = ROUND_COLORS[round.round] || ROGERS_GREEN
              const isChampionship = round.round === 'Championship'
              return (
                <div key={ri} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  {/* Round header */}
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isChampionship ? '#fff7ed' : '#fafafa' }}>
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
                  {round.games.map((game, gi) => {
                    const isBye = !!game.note
                    return (
                      <div
                        key={gi}
                        style={{
                          padding: '14px 20px',
                          borderBottom: gi < round.games.length - 1 ? '1px solid #f3f4f6' : 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                          background: isBye ? '#fafafa' : 'white',
                          opacity: isBye ? 0.55 : 1,
                        }}
                      >
                        {/* Game number badge */}
                        <div style={{ flexShrink: 0, minWidth: '52px' }}>
                          {game.gameNumber && !isBye && (
                            <span style={{ fontSize: '11px', fontWeight: 700, color: color, background: `${color}15`, border: `1px solid ${color}40`, padding: '2px 8px', borderRadius: '10px' }}>
                              #{game.gameNumber}
                            </span>
                          )}
                        </div>

                        {/* Matchup */}
                        <div style={{ flex: 1 }}>
                          {isBye ? (
                            <p style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
                              {game.matchup} — Bye (advances automatically)
                            </p>
                          ) : (
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                              {game.matchup}
                            </p>
                          )}
                        </div>

                        {/* Time / field */}
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
              )
            })}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>No playoff data found.</p>
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
