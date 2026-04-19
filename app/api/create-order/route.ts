import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateInvoiceId } from '@/lib/web3/config'

export async function POST(request: NextRequest) {
  try {
    const { cartItems, walletAddress } = await request.json()
    
    if (!cartItems || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get MBONE price from settings
    const { data: mboneSetting, error: settingError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'mbone_price_usd')
      .single()

    if (settingError || !mboneSetting) {
      return NextResponse.json({ error: 'MBONE price not configured' }, { status: 500 })
    }

    const mbonePriceUsd = parseFloat(mboneSetting.value)

    // Calculate totals
    let totalUSD = 0
    const orderItems = []

    for (const item of cartItems) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product.id)
        .single()

      if (!product) {
        return NextResponse.json({ error: `Product ${item.product.id} not found` }, { status: 404 })
      }

      const itemTotal = product.final_mrp * item.quantity
      totalUSD += itemTotal

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price_usd: product.final_mrp,
        price_mbone: product.final_mrp / mbonePriceUsd
      })
    }

    // Calculate MBONE amount using dynamic price
    const totalMBONEFloat = totalUSD / mbonePriceUsd
    const totalMBONE = BigInt(Math.floor(totalMBONEFloat * 1e18))

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        wallet_address: walletAddress,
        total_usd: totalUSD,
        total_mbone: totalMBONEFloat,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Generate order hash
    const orderHash = `0x${Buffer.from(order.id).toString('hex').padStart(64, '0')}`
    const invoiceId = generateInvoiceId(order.id)

    // Update order with hash and invoice ID
    await supabase
      .from('orders')
      .update({ 
        order_hash: orderHash,
        invoice_id: invoiceId
      })
      .eq('id', order.id)

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId)

    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
    }

    return NextResponse.json({
      orderId: order.id,
      orderHash,
      invoiceId,
      totalUSD,
      totalMBONE: totalMBONE.toString(),
      mbonePriceUsd,
      success: true
    })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}