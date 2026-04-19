'use client'

import { OrderManagement } from '@/components/dashboard/OrderManagement'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    } else if (!loading && user && user.id !== process.env.NEXT_PUBLIC_ADMIN_USER_ID) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
      </div>
    )
  }

  if (!user || user.id !== process.env.NEXT_PUBLIC_ADMIN_USER_ID) {
    return null
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-secondary mb-2">Order Management</h1>
        <p className="text-muted-foreground">Process orders and manage shipments</p>
      </div>

      <OrderManagement />
    </div>
  )
}