export const generateInvoiceId = (orderId: string): string => {
  // Generate a simple invoice ID based on order ID
  const timestamp = Date.now().toString().slice(-6)
  const orderPrefix = orderId.slice(0, 8)
  return `INV-${orderPrefix}-${timestamp}`
}

export const WEB3_CONFIG = {
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'),
  CHAIN_NAME: process.env.NEXT_PUBLIC_CHAIN_NAME || 'Ethereum Sepolia',
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.gateway.tenderly.co/2LHJSrKH72h9RPnYgn2myd',
  MBONE_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_MBONE_TOKEN_ADDRESS || '0x4c612CcA508c45cca9ed0d647be4bf37303942f5',
  PAYMENT_PROCESSOR_ADDRESS: process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS || '0x27a7d36A85CE3FAc70FECD4DA0Bb510892Afa4C5'
}