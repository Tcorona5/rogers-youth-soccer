import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Game = {
  id: number
  game_number: string
  division_slug: string
  game_date: string | null
  game_time: string | null
  field: string | null
  home_team: string
  home_flag: string
  away_team: string
  away_flag: string
  home_score: number | null
  away_score: number | null
  is_cancelled: boolean
  counts_for_standings: boolean
}

export type Division = {
  slug: string
  display_name: string
  sort_order: number
}

export type StandingsRow = {
  team: string
  flag: string
  gp: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  gd: number
  pts: number
}
