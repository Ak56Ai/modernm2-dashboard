import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId, courierName, trackingNumber, status } = await request.json()
    
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check here

    // Update shipment
    const updateData: any = { status }
    
    if (courierName) updateData.courier_name = courierName
    if (trackingNumber) updateData.tracking_number = trackingNumber
    
    if (status === 'shipped' && !updateData.shipped_at) {
      updateData.shipped_at = new Date().toISOString()
    }
    
    if (status === 'delivered' && !updateData.delivered_at) {
      updateData.delivered_at = new Date().toISOString()
    }

    const { data: shipment, error } = await supabase
      .from('shipments')
      .upsert({
        order_id: orderId,
        ...updateData
      }, {
        onConflict: 'order_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Shipment update error:', error)
      return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 })
    }

    // Update order status if shipped
    if (status === 'shipped') {
      await supabase
        .from('orders')
        .update({ status: 'shipped' })
        .eq('id', orderId)
    }

    return NextResponse.json({ shipment, success: true })

  } catch (error) {
    console.error('Update shipment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}