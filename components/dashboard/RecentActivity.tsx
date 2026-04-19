'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Package, ShoppingCart, DollarSign, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  type: 'user' | 'product' | 'order' | 'payment'
  title: string
  description: string
  timestamp: string
  status?: string
  amount?: number
  user_email?: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
    
    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchRecentActivity()
      })
      .subscribe()

    const usersSubscription = supabase
      .channel('users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchRecentActivity()
      })
      .subscribe()

    return () => {
      ordersSubscription.unsubscribe()
      usersSubscription.unsubscribe()
    }
  }, [])

  const fetchRecentActivity = async () => {
    try {
      const activities: ActivityItem[] = []

      // Fetch recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          total_usd,
          status,
          created_at,
          users(email)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      orders?.forEach(order => {
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          title: 'New Order',
          description: `Order #${order.id.slice(0, 8)} for $${order.total_usd}`,
          timestamp: order.created_at,
          status: order.status,
          amount: order.total_usd,
          user_email: order.users?.email
        })
      })

      // Fetch recent users
      const { data: users } = await supabase
        .from('users')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      users?.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user',
          title: 'New User Registration',
          description: `${user.email} joined the platform`,
          timestamp: user.created_at,
          user_email: user.email
        })
      })

      // Fetch recent payments
      const { data: payments } = await supabase
        .from('crypto_payments')
        .select(`
          id,
          amount,
          status,
          created_at,
          orders(users(email))
        `)
        .order('created_at', { ascending: false })
        .limit(3)

      payments?.forEach(payment => {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          title: 'Payment Received',
          description: `${payment.amount} MBONE payment confirmed`,
          timestamp: payment.created_at,
          status: payment.status,
          amount: payment.amount,
          user_email: payment.orders?.users?.email
        })
      })

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setActivities(activities.slice(0, 10))
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return User
      case 'product': return Package
      case 'order': return ShoppingCart
      case 'payment': return DollarSign
      default: return Clock
    }
  }

  const getActivityColor = (type: string, status?: string) => {
    if (status === 'paid' || status === 'confirmed') return 'text-green-600'
    if (status === 'pending') return 'text-yellow-600'
    if (status === 'failed') return 'text-red-600'
    
    switch (type) {
      case 'user': return 'text-blue-600'
      case 'product': return 'text-purple-600'
      case 'order': return 'text-brand-accent'
      case 'payment': return 'text-green-600'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      shipped: { color: 'bg-blue-100 text-blue-800', icon: Package }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null
    
    const StatusIcon = config.icon
    
    return (
      <Badge className={`${config.color} text-xs flex items-center gap-1`}>
        <StatusIcon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg text-brand-secondary">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
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
        <CardTitle className="text-lg text-brand-secondary">Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Latest updates from your platform</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              const iconColor = getActivityColor(activity.type, activity.status)
              
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-brand-secondary truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(activity.status)}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    
                    {activity.user_email && (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-xs bg-brand-primary text-white">
                            {activity.user_email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {activity.user_email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}