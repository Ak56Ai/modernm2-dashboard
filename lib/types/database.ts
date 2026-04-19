export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  mrp: number
  discount: number
  final_mrp: number
  you_save: number
  exclusive_reward: string | null
  stock_quantity: number
  image_url: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  position: number
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  wallet_address: string | null
  total_usd: number
  total_mbone: number
  status: 'pending' | 'paid' | 'failed' | 'shipped' | 'cancelled'
  payment_tx_hash: string | null
  order_hash: string | null
  invoice_id: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_usd: number
  price_mbone: number
  product?: Product
}

export interface CryptoPayment {
  id: string
  order_id: string
  chain: string
  token_symbol: string
  amount: number
  tx_hash: string | null
  from_wallet: string | null
  to_contract: string | null
  status: string
  created_at: string
}

export interface Setting {
  id: string
  key: string
  value: string
  updated_at: string
}

export interface Shipment {
  id: string
  order_id: string
  courier_name: string | null
  tracking_number: string | null
  status: 'processing' | 'shipped' | 'in_transit' | 'delivered'
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
}