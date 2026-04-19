'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface Stats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  userGrowth: number
  orderGrowth: number
  revenueGrowth: number
  productGrowth: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    userGrowth: 0,
    orderGrowth: 0,
    revenueGrowth: 0,
    productGrowth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get current month stats
      const currentMonth = new Date()
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

      // Fetch total counts
      const [usersResult, productsResult, ordersResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true })
      ])

      // Fetch revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_usd')
        .eq('status', 'paid')

      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_usd, 0) || 0

      // Fetch growth data (current month vs last month)
      const [currentMonthUsers, lastMonthUsers] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', currentMonthStart.toISOString()),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', lastMonth.toISOString()).lt('created_at', currentMonthStart.toISOString())
      ])

      const [currentMonthOrders, lastMonthOrders] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', currentMonthStart.toISOString()),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', lastMonth.toISOString()).lt('created_at', currentMonthStart.toISOString())
      ])

      const [currentMonthRevenue, lastMonthRevenue] = await Promise.all([
        supabase.from('orders').select('total_usd').eq('status', 'paid').gte('created_at', currentMonthStart.toISOString()),
        supabase.from('orders').select('total_usd').eq('status', 'paid').gte('created_at', lastMonth.toISOString()).lt('created_at', currentMonthStart.toISOString())
      ])

      const currentRevenue = currentMonthRevenue.data?.reduce((sum, order) => sum + order.total_usd, 0) || 0
      const lastRevenue = lastMonthRevenue.data?.reduce((sum, order) => sum + order.total_usd, 0) || 0

      // Calculate growth percentages
      const userGrowth = lastMonthUsers.count ? ((currentMonthUsers.count || 0) - lastMonthUsers.count) / lastMonthUsers.count * 100 : 0
      const orderGrowth = lastMonthOrders.count ? ((currentMonthOrders.count || 0) - lastMonthOrders.count) / lastMonthOrders.count * 100 : 0
      const revenueGrowth = lastRevenue ? (currentRevenue - lastRevenue) / lastRevenue * 100 : 0

      setStats({
        totalUsers: usersResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue,
        userGrowth,
        orderGrowth,
        revenueGrowth,
        productGrowth: 0 // Products don't have monthly growth tracking
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      growth: stats.userGrowth,
      color: 'text-blue-600'
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: Package,
      growth: stats.productGrowth,
      color: 'text-green-600'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      growth: stats.orderGrowth,
      color: 'text-purple-600'
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      growth: stats.revenueGrowth,
      color: 'text-brand-accent'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        const isPositiveGrowth = stat.growth >= 0
        const GrowthIcon = isPositiveGrowth ? TrendingUp : TrendingDown
        
        return (
          <Card key={index} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-secondary">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              {stat.growth !== 0 && (
                <div className={`flex items-center text-xs ${
                  isPositiveGrowth ? 'text-green-600' : 'text-red-600'
                }`}>
                  <GrowthIcon className="h-3 w-3 mr-1" />
                  {Math.abs(stat.growth).toFixed(1)}% from last month
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}