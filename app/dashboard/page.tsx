'use client'

import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { ProjectOverview } from '@/components/dashboard/ProjectOverview'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
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
        <h1 className="text-3xl font-bold text-brand-secondary mb-2">Project Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your ModernMart project.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <DashboardStats />
          <ProjectOverview />
          <RecentActivity />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  )
}