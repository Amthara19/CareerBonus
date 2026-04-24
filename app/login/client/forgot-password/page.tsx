'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function ClientForgotPassword() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/client/update-password`,
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password reset link sent! Please check your email inbox.' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl text-[#6382ff]">◈</span>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">CareerBonus</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Reset password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your work email to receive a reset link</p>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8">
          {message && (
            <div className={`text-sm rounded-lg px-4 py-3 mb-6 ${
              message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleResetRequest} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Work email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] transition text-sm shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#34d399] hover:bg-[#10b981] text-[#04342C] font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
            >
              {loading ? 'Sending link...' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login/client" className="text-sm text-gray-500 hover:text-gray-800 transition">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
