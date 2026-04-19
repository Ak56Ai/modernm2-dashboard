import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: setting, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'mbone_price_usd')
      .single()

    if (error || !setting) {
      return NextResponse.json({ error: 'MBONE price not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      price: parseFloat(setting.value)
    })

  } catch (error) {
    console.error('Get MBONE price error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}