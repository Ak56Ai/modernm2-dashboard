'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, Calendar, CircleCheck as CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface ProjectMetrics {
  monthlyTarget: number
  currentRevenue: number
  ordersTarget: number
  currentOrders: number
  usersTarget: number
  currentUsers: number
  completedTasks: number
  totalTasks: number
}

export function ProjectOverview() {
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    monthlyTarget: 10000,
    currentRevenue: 0,
    ordersTarget: 100,
    currentOrders: 0,
    usersTarget: 500,
    currentUsers: 0,
    completedTasks: 8,
    totalTasks: 12
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjectMetrics()
  }, [])

  const fetchProjectMetrics = async () => {
    try {
      const currentMonth = new Date()
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

      // Fetch current month revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_usd')
        .eq('status', 'paid')
        .gte('created_at', monthStart.toISOString())

      const currentRevenue = revenueData?.reduce((sum, order) => sum + order.total_usd, 0) || 0

      // Fetch current month orders
      const { data: ordersData, count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())

      // Fetch total users
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      setMetrics(prev => ({
        ...prev,
        currentRevenue,
        currentOrders: ordersCount || 0,
        currentUsers: usersCount || 0
      }))
    } catch (error) {
      console.error('Error fetching project metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const revenueProgress = (metrics.currentRevenue / metrics.monthlyTarget) * 100
  const ordersProgress = (metrics.currentOrders / metrics.ordersTarget) * 100
  const usersProgress = (metrics.currentUsers / metrics.usersTarget) * 100
  const tasksProgress = (metrics.completedTasks / metrics.totalTasks) * 100

  const projectGoals = [
    {
      title: 'Monthly Revenue Target',
      current: metrics.currentRevenue,
      target: metrics.monthlyTarget,
      progress: revenueProgress,
      icon: Target,
      color: 'text-green-600',
      format: (value: number) => `$${value.toFixed(2)}`
    },
    {
      title: 'Orders This Month',
      current: metrics.currentOrders,
      target: metrics.ordersTarget,
      progress: ordersProgress,
      icon: TrendingUp,
      color: 'text-blue-600',
      format: (value: number) => value.toString()
    },
    {
      title: 'Total Users',
      current: metrics.currentUsers,
      target: metrics.usersTarget,
      progress: usersProgress,
      icon: Calendar,
      color: 'text-purple-600',
      format: (value: number) => value.toString()
    },
    {
      title: 'Project Tasks',
      current: metrics.completedTasks,
      target: metrics.totalTasks,
      progress: tasksProgress,
      icon: CheckCircle,
      color: 'text-brand-accent',
      format: (value: number) => value.toString()
    }
  ]

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg text-brand-secondary">Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-2 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg text-brand-secondary">Project Overview</CardTitle>
        <p className="text-sm text-muted-foreground">Track progress towards monthly goals</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {projectGoals.map((goal, index) => {
          const Icon = goal.icon
          const isOnTrack = goal.progress >= 75
          const isComplete = goal.progress >= 100
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${goal.color}`} />
                  <span className="font-medium text-sm text-brand-secondary">{goal.title}</span>
                  {isComplete && (
                    <Badge className="bg-green-100 text-green-800 text-xs">Complete</Badge>
                  )}
                  {isOnTrack && !isComplete && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">On Track</Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {goal.format(goal.current)} / {goal.format(goal.target)}
                </span>
              </div>
              
              <Progress 
                value={Math.min(goal.progress, 100)} 
                className="h-2"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{goal.progress.toFixed(1)}% complete</span>
                <span>
                  {goal.progress >= 100 ? 'Target achieved!' : 
                   `${goal.format(goal.target - goal.current)} remaining`}
                </span>
              </div>
            </div>
          )
        })}

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-brand-secondary">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {((revenueProgress + ordersProgress + usersProgress + tasksProgress) / 4).toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={(revenueProgress + ordersProgress + usersProgress + tasksProgress) / 4} 
            className="h-2 mt-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}