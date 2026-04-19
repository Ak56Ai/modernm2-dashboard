import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)
  
  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/signin')
  }
  
  // Check if user is admin
  const isAdmin = user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-secondary mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this admin dashboard.</p>
        </div>
      </div>
    )
  }
  
  // Redirect admin to dashboard
  redirect('/dashboard')
}