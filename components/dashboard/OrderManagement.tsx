'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, MoveHorizontal as MoreHorizontal, ShoppingCart, Package, Truck, CircleCheck as CheckCircle, Clock, DollarSign, User, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Order {
  id: string
  user_id: string
  wallet_address: string | null
  total_usd: number
  total_mbone: number
  status: string
  payment_tx_hash: string | null
  order_hash: string | null
  invoice_id: string | null
  created_at: string
  users?: {
    email: string
    full_name?: string
  }
  order_items?: Array<{
    id: string
    product_id: string
    quantity: number
    price_usd: number
    product?: {
      name: string
      image_url?: string
    }
  }>
  shipments?: Array<{
    id: string
    courier_name: string | null
    tracking_number: string | null
    status: string
    shipped_at: string | null
    delivered_at: string | null
  }>
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false)

  const [shipmentData, setShipmentData] = useState({
    courierName: '',
    trackingNumber: '',
    status: 'processing'
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    const filtered = orders.filter(order =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.invoice_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredOrders(filtered)
  }, [orders, searchTerm])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users(email, full_name),
          order_items(
            id,
            product_id,
            quantity,
            price_usd,
            products(name, image_url)
          ),
          shipments(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateShipment = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch('/api/admin/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          courierName: shipmentData.courierName,
          trackingNumber: shipmentData.trackingNumber,
          status: shipmentData.status
        }),
      })

      if (!response.ok) throw new Error('Failed to update shipment')

      toast.success('Shipment updated successfully')
      setIsShipmentDialogOpen(false)
      setShipmentData({
        courierName: '',
        trackingNumber: '',
        status: 'processing'
      })
      fetchOrders()
    } catch (error) {
      console.error('Error updating shipment:', error)
      toast.error('Failed to update shipment')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock
      case 'paid': return CheckCircle
      case 'shipped': return Truck
      case 'delivered': return Package
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-purple-100 text-purple-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    totalRevenue: orders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + o.total_usd, 0)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-96 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-brand-secondary">{stats.total}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-brand-secondary">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shipped Orders</p>
                <p className="text-2xl font-bold text-brand-secondary">{stats.shipped}</p>
              </div>
              <Truck className="h-8 w-8 text-brand-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-brand-secondary">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-brand-secondary">All Orders</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No orders found matching your search' : 'No orders found'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status)
                    const shipment = order.shipments?.[0]
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-brand-secondary">
                              #{order.invoice_id || order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.order_items?.length || 0} items
                            </p>
                            {order.payment_tx_hash && (
                              <div className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {order.payment_tx_hash.slice(0, 10)}...
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-brand-secondary">
                                {order.users?.full_name || order.users?.email?.split('@')[0]}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.users?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-brand-secondary">
                              ${order.total_usd.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.total_mbone.toFixed(2)} MBONE
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                              <StatusIcon className="h-3 w-3" />
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            {shipment && shipment.tracking_number && (
                              <div className="text-xs text-muted-foreground">
                                Tracking: {shipment.tracking_number}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShipmentData({
                                    courierName: shipment?.courier_name || '',
                                    trackingNumber: shipment?.tracking_number || '',
                                    status: shipment?.status || 'processing'
                                  })
                                  setIsShipmentDialogOpen(true)
                                }}
                              >
                                <Truck className="h-4 w-4 mr-2" />
                                Update Shipment
                              </DropdownMenuItem>
                              {order.payment_tx_hash && (
                                <DropdownMenuItem 
                                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${order.payment_tx_hash}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Transaction
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Shipment Update Dialog */}
      <Dialog open={isShipmentDialogOpen} onOpenChange={setIsShipmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Shipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="courier">Courier Name</Label>
              <Input
                id="courier"
                value={shipmentData.courierName}
                onChange={(e) => setShipmentData({...shipmentData, courierName: e.target.value})}
                placeholder="Enter courier name"
              />
            </div>
            <div>
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                value={shipmentData.trackingNumber}
                onChange={(e) => setShipmentData({...shipmentData, trackingNumber: e.target.value})}
                placeholder="Enter tracking number"
              />
            </div>
            <div>
              <Label htmlFor="status">Shipment Status</Label>
              <Select 
                value={shipmentData.status} 
                onValueChange={(value) => setShipmentData({...shipmentData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdateShipment} className="w-full bg-brand-accent hover:bg-brand-accent/90">
              Update Shipment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}