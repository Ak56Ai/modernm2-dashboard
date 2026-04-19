import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check here
    // For now, any authenticated user can access admin features

    // Get all paid orders with shipment info
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        shipments(*)
      `)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json({ orders })

  } catch (error) {
    console.error('Admin orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}