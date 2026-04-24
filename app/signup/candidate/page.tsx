'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function CandidateSignup() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=candidate`,
      },
    })

    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'candidate',
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/candidate')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 50%, #e3ecfb 100%)'
    }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl" style={{ color: '#4f6aff' }}>◈</span>
            <span className="text-2xl font-bold tracking-tight" style={{ color: '#1e3a8a' }}>CareerBonus</span>
          </a>
          <h1 className="text-xl font-semibold" style={{ color: '#1e3a8a' }}>Create your account</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Find your next opportunity</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition text-sm mb-5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200"/>
            <span className="text-xs text-gray-400">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200"/>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Full name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                minLength={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm bg-gray-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-1"
              style={{ background: 'linear-gradient(135deg, #4f6aff, #3b5bdb)' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login/candidate" className="font-medium hover:underline" style={{ color: '#4f6aff' }}>
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Are you a company?{' '}
          <Link href="/signup/client" className="font-medium hover:underline" style={{ color: '#059669' }}>
            Register as client
          </Link>
        </p>

        <p className="text-center text-sm text-gray-400 mt-3">
          <a href="/" className="hover:text-gray-600 transition">← Back to home</a>
        </p>

      </div>
    </div>
  )
}
