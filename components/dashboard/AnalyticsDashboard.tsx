'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  Target
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  revenueGrowth: number
  orderGrowth: number
  userGrowth: number
  averageOrderValue: number
  conversionRate: number
  topProducts: Array<{
    name: string
    revenue: number
    orders: number
  }>
  dailyPerformance: Array<{
    date: string
    revenue: number
    orders: number
    users: number
  }>
  orderStatusDistribution: Array<{
    name: string
    value: number
    color: string
  }>
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    userGrowth: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topProducts: [],
    dailyPerformance: [],
    orderStatusDistribution: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const currentDate = new Date()
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const last7Days = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Fetch basic counts
      const [ordersResult, usersResult, productsResult] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true })
      ])

      // Fetch revenue data
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_usd, created_at')
        .eq('status', 'paid')

      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_usd, 0) || 0

      // Fetch current month data for growth calculations
      const [currentMonthOrders, lastMonthOrders] = await Promise.all([
        supabase.from('orders').select('total_usd').eq('status', 'paid').gte('created_at', currentMonthStart.toISOString()),
        supabase.from('orders').select('total_usd').eq('status', 'paid').gte('created_at', lastMonth.toISOString()).lt('created_at', currentMonthStart.toISOString())
      ])

      const [currentMonthUsers, lastMonthUsers] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', currentMonthStart.toISOString()),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', lastMonth.toISOString()).lt('created_at', currentMonthStart.toISOString())
      ])

      // Calculate growth rates
      const currentRevenue = currentMonthOrders.data?.reduce((sum, order) => sum + order.total_usd, 0) || 0
      const lastRevenue = lastMonthOrders.data?.reduce((sum, order) => sum + order.total_usd, 0) || 0
      const revenueGrowth = lastRevenue ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0

      const orderGrowth = lastMonthOrders.data?.length ? 
        ((currentMonthOrders.data?.length || 0) - lastMonthOrders.data.length) / lastMonthOrders.data.length * 100 : 0

      const userGrowth = lastMonthUsers.count ? 
        ((currentMonthUsers.count || 0) - lastMonthUsers.count) / lastMonthUsers.count * 100 : 0

      // Calculate average order value
      const averageOrderValue = ordersResult.count ? totalRevenue / ordersResult.count : 0

      // Fetch top products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          quantity,
          price_usd,
          products(name)
        `)

      const productRevenue: { [key: string]: { revenue: number; orders: number } } = {}
      orderItems?.forEach(item => {
        const productName = item.products?.name || 'Unknown'
        if (!productRevenue[productName]) {
          productRevenue[productName] = { revenue: 0, orders: 0 }
        }
        productRevenue[productName].revenue += item.price_usd * item.quantity
        productRevenue[productName].orders += item.quantity
      })

      const topProducts = Object.entries(productRevenue)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Fetch daily performance for last 7 days
      const dailyPerformance = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const [dayOrders, dayUsers] = await Promise.all([
          supabase.from('orders').select('total_usd').eq('status', 'paid')
            .gte('created_at', dateStr).lt('created_at', nextDate),
          supabase.from('users').select('*', { count: 'exact', head: true })
            .gte('created_at', dateStr).lt('created_at', nextDate)
        ])

        dailyPerformance.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: dayOrders.data?.reduce((sum, order) => sum + order.total_usd, 0) || 0,
          orders: dayOrders.data?.length || 0,
          users: dayUsers.count || 0
        })
      }

      // Fetch order status distribution
      const { data: orderStatuses } = await supabase
        .from('orders')
        .select('status')

      const statusCounts: { [key: string]: number } = {}
      orderStatuses?.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
      })

      const statusColors = {
        pending: '#f59e0b',
        paid: '#10b981',
        shipped: '#3b82f6',
        delivered: '#8b5cf6',
        failed: '#ef4444'
      }

      const orderStatusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: statusColors[name as keyof typeof statusColors] || '#6b7280'
      }))

      setAnalytics({
        totalRevenue,
        totalOrders: ordersResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalProducts: productsResult.count || 0,
        revenueGrowth,
        orderGrowth,
        userGrowth,
        averageOrderValue,
        conversionRate: usersResult.count ? (ordersResult.count || 0) / usersResult.count * 100 : 0,
        topProducts,
        dailyPerformance,
        orderStatusDistribution
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      growth: analytics.revenueGrowth,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Total Orders',
      value: analytics.totalOrders.toString(),
      growth: analytics.orderGrowth,
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Total Users',
      value: analytics.totalUsers.toString(),
      growth: analytics.userGrowth,
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Avg Order Value',
      value: `$${analytics.averageOrderValue.toFixed(2)}`,
      growth: 0,
      icon: Target,
      color: 'text-brand-accent'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-80 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          const isPositiveGrowth = kpi.growth >= 0
          const GrowthIcon = isPositiveGrowth ? TrendingUp : TrendingDown
          
          return (
            <Card key={index} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-brand-secondary">{kpi.value}</p>
                  {kpi.growth !== 0 && (
                    <div className={`flex items-center text-xs ${
                      isPositiveGrowth ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <GrowthIcon className="h-3 w-3 mr-1" />
                      {Math.abs(kpi.growth).toFixed(1)}% from last month
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg text-brand-secondary">7-Day Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#FE7F2D" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#215E61" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg text-brand-secondary">Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.orderStatusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.orderStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg text-brand-secondary">Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topProducts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#FE7F2D" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg text-brand-secondary">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-brand-secondary">Conversion Rate</p>
                  <p className="text-sm text-muted-foreground">Orders per user</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {analytics.conversionRate.toFixed(1)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-brand-secondary">Monthly Growth</p>
                  <p className="text-sm text-muted-foreground">Revenue increase</p>
                </div>
              </div>
              <Badge className={`${
                analytics.revenueGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-brand-secondary">Product Catalog</p>
                  <p className="text-sm text-muted-foreground">Total products</p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                {analytics.totalProducts}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}