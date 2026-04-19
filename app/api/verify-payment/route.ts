import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId, txHash, invoiceId } = await request.json()
    
    if (!orderId || !txHash || !invoiceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get order from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 })
    }

    // Verify invoice ID matches
    if (order.invoice_id !== invoiceId) {
      return NextResponse.json({ error: 'Invoice ID mismatch' }, { status: 400 })
    }

    // Verify transaction on blockchain
    // TODO: Add real blockchain verification here
    console.log('Verifying transaction:', txHash)
    
    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_tx_hash: txHash
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Order update error:', updateError)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // Create crypto payment record
    const { error: paymentError } = await supabase
      .from('crypto_payments')
      .insert({
        order_id: orderId,
        chain: 'polygon',
        token_symbol: 'MBONE',
        amount: order.total_mbone,
        tx_hash: txHash,
        from_wallet: order.wallet_address,
        to_contract: process.env.PAYMENT_PROCESSOR_ADDRESS || 'demo-contract',
        status: 'confirmed'
      })

    if (paymentError) {
      console.error('Payment record error:', paymentError)
    }

    // Create initial shipment record
    const { error: shipmentError } = await supabase
      .from('shipments')
      .insert({
        order_id: orderId,
        status: 'processing'
      })

    if (shipmentError) {
      console.error('Shipment creation error:', shipmentError)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully'
    })

  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}