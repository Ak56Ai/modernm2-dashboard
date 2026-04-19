'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, Package, ShoppingCart, BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  const actions = [
    {
      title: 'Add New Product',
      description: 'Add a new product to your catalog',
      icon: Plus,
      href: '/dashboard/products',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'View Users',
      description: 'Manage user accounts',
      icon: Users,
      href: '/dashboard/users',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Process Orders',
      description: 'Review and process pending orders',
      icon: ShoppingCart,
      href: '/dashboard/orders',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-brand-accent hover:bg-brand-accent/90'
    }
  ]

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg text-brand-secondary">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-muted/50"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-brand-secondary">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}