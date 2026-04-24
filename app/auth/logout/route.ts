import { createClient } from '@/utils/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  
  // 1. Tell Supabase to sign out (this clears the session)
  await supabase.auth.signOut()

  // 2. Clear the browser cookies by redirecting
  const logoutUrl = new URL('/signup/candidate', request.url)
  return NextResponse.redirect(logoutUrl, {
    status: 302,
  })
}
