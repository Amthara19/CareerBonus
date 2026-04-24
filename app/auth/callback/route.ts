import { createServerSupabaseClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') ?? 'candidate'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile already exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // If no profile yet (first Google login), create one
      if (!existing) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name ?? '',
          role: role,
          status: 'active',
        })
      }

      // Redirect based on role
      if (role === 'candidate') {
        return NextResponse.redirect(`${origin}/dashboard/candidate`)
      }
    }
  }

  // Something went wrong — go back to signup
  return NextResponse.redirect(`${origin}/signup/candidate`)
}
