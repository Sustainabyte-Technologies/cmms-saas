import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: 'FixByte - Modern CMMS Platform for Maintenance Excellence',
  description: 'Manage assets, work orders, preventive maintenance, inventory, and purchasing from one unified platform. Streamline your maintenance operations and reduce downtime.',
  keywords: ['CMMS', 'maintenance management', 'asset management', 'work orders', 'preventive maintenance', 'inventory management'],
  authors: [{ name: 'FixByte' }],
  openGraph: {
    title: 'FixByte - Modern CMMS Platform',
    description: 'Manage assets, work orders, preventive maintenance, inventory, and purchasing from one unified platform.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#81C816',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} bg-background`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
