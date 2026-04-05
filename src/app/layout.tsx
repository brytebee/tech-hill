import './globals.css'
import localFont from 'next/font/local'
import { Providers } from '@/components/providers'

// Serve Inter from the local file system — eliminates repeated Google Fonts
// network round-trips that flood the dev terminal with 404 warnings.
const inter = localFont({
  src: [
    { path: '../../public/fonts/inter-var.woff2', weight: '100 900', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
})

export const metadata = {
  title: 'Tech Hill - Computer Literacy Platform',
  description: 'Master computer skills with our comprehensive learning platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}