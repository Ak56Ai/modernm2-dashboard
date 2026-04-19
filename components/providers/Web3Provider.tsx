'use client'

import { ReactNode } from 'react'

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  // Simplified Web3 provider for admin dashboard
  // In a full e-commerce app, this would include RainbowKit and Wagmi
  return <>{children}</>
}