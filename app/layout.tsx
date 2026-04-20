import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rogers Youth Soccer | Spring 2026',
  description: 'Spring 2026 standings and results — Rogers Community-School Recreation Association',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
