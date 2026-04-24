'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function AdminLogin() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Attempt to sign in via Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // 2. Fetch the profile to verify role and status
    // We use .maybeSingle() to handle cases where the row might not exist yet
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .maybeSingle()

    // 3. Strict Verification Logic
    // This checks if the profile exists, if the role is 'admin', and if the status is 'active'
    if (profileError) {
      await supabase.auth.signOut()
      setError('Database connection error. Please try again.')
    } else if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Access denied. Admin accounts only.')
    } else if (profile.status !== 'active') {
      await supabase.auth.signOut()
      setError('Your admin account is currently inactive.')
    } else {
      // SUCCESS: Redirect to the admin dashboard
      router.push('/dashboard/admin')
      router.refresh()
      return 
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl text-[#6382ff]">◈</span>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">CareerBonus</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Admin portal</h1>
          <p className="text-sm text-gray-500 mt-1">Restricted access</p>
        </div>

        {/* Warning badge */}
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-4 py-3 mb-6 text-center font-medium">
          Authorized personnel only. All access is logged.
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8">

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@careerbonus.com"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition text-sm shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition text-sm shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] text-[#412402] font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
            >
              {loading ? 'Verifying credentials...' : 'Sign in as admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/" className="hover:text-gray-800 transition">← Back to home</Link>
        </p>

      </div>
    </div>
  )
}
