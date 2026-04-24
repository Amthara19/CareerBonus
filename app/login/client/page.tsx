'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function ClientLogin() {
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

    // 1. Auth Sign In
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    // 2. Fetch Profile to check role and status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .maybeSingle()

    // DEBUG: Open browser console (F12) to see this if login fails
    console.log("Client Profile check:", { profile, error: profileError })

    // 3. Verification Logic
    if (profileError) {
      await supabase.auth.signOut()
      setError('Connection error. Please try again.')
    } else if (!profile || profile.role !== 'client') {
      await supabase.auth.signOut()
      setError('No client account found with these credentials')
    } else if (profile.status === 'pending') {
      await supabase.auth.signOut()
      setError('Your account is pending admin approval. Please check back later.')
    } else if (profile.status === 'rejected') {
      await supabase.auth.signOut()
      setError('Your account has been rejected. Please contact support.')
    } else if (profile.status === 'active') {
      // Success!
      router.push('/dashboard/client')
      router.refresh()
      return 
    } else {
      await supabase.auth.signOut()
      setError('Account status unknown. Please contact admin.')
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
          <h1 className="text-xl font-semibold text-gray-900">Client portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your job postings</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8">

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Work email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] transition text-sm shadow-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link 
                  href="/login/client/forgot-password" 
                  className="text-xs text-[#6382ff] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] transition text-sm shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#34d399] hover:bg-[#10b981] text-[#04342C] font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account yet?{' '}
            <Link href="/signup/client" className="text-[#34d399] font-semibold hover:underline">
              Register your company
            </Link>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/" className="hover:text-gray-800 transition">← Back to home</Link>
        </p>

      </div>
    </div>
  )
}
