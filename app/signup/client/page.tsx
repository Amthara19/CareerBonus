'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function ClientSignup() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

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
          role: 'client',
          company_name: companyName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Sign out immediately — client must wait for admin approval
    await supabase.auth.signOut()
    setDone(true)
    setLoading(false)
  }

  // Success screen — waiting for approval
  if (done) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-6">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Registration Successful!</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Your account has been created and is pending admin approval.<br />
            You will be able to login once approved.
          </p>
          <Link
            href="/"
            className="inline-block bg-gray-100 border border-gray-200 text-gray-900 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
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
          <h1 className="text-xl font-semibold text-gray-900">Register your company</h1>
          <p className="text-sm text-gray-500 mt-1">Post jobs and find great talent</p>
        </div>

        {/* Pending Notice */}
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-4 py-3 mb-6 text-center font-medium">
          Your account will require admin approval before you can login
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8">

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your full name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] transition text-sm shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Acme Sdn Bhd"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] transition text-sm shadow-sm"
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                minLength={6}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] transition text-sm shadow-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#34d399] hover:bg-[#10b981] text-[#04342C] font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already approved?{' '}
            <Link href="/login/client" className="text-[#34d399] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Looking for a job?{' '}
          <Link href="/signup/candidate" className="text-[#6382ff] font-medium hover:underline">
            Register as jobseeker
          </Link>
        </p>

      </div>
    </div>
  )
}
