import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Web3Provider } from '@/components/providers/Web3Provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ModernMart - Premium Electronics & Gadgets',
  description: 'Discover the latest electronics, gadgets, and tech accessories at unbeatable prices',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <AuthProvider>
            <div className="min-h-screen bg-brand-background">
              <Header />
              <main>{children}</main>
              <Toaster />
            </div>
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  )
}