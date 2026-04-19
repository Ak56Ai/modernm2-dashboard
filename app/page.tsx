import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// 1. Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // 2. Wrap in a try-catch or ensure it's strictly server-side
  let user = null;

  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (e) {
    // This catches cases where storage isn't available
    console.error("Auth check failed:", e)
  }

  if (!user) {
    redirect('/auth/signin')
  }

  const isAdmin = user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        </div>
      </div>
    )
  }

  redirect('/dashboard')
}