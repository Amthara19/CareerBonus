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
    
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    
    if (authError) {
      setError('Invalid email or password'); 
      setLoading(false); 
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!profile || profile.role !== 'client') {
      await supabase.auth.signOut(); 
      setError('No client account found'); 
      setLoading(false); 
      return
    }

    if (profile.status !== 'active') {
      await supabase.auth.signOut();
      setError('Your account is pending admin approval.');
      setLoading(false);
      return
    }

    router.push('/dashboard/client')
    router.refresh()
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#ffffff', 
      padding: '20px', 
      fontFamily: 'sans-serif' 
    }}>
      
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px', textDecoration: 'none' }}>
          <span style={{ fontSize: '24px', color: '#6382ff' }}>◈</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>CareerBonus</span>
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0' }}>Job Seeker portal</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Sign in to manage your job postings</p>
      </div>

      {/* The Login Card - Fixed Width */}
      <div style={{ 
        width: '100%', 
        maxWidth: '440px', 
        backgroundColor: '#ffffff', 
        border: '1px solid #f3f4f6', 
        borderRadius: '32px', 
        padding: '40px', 
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04)',
        boxSizing: 'border-box'
      }}>

        {/* Google Login Button with Built-in SVG */}
        <button
          onClick={signInWithGoogle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '14px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            cursor: 'pointer',
            marginBottom: '24px',
            transition: 'background-color 0.2s'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ borderTop: '1px solid #f3f4f6', width: '100%' }}></div>
          <span style={{ backgroundColor: '#ffffff', padding: '0 12px', fontSize: '11px', color: '#9ca3af', position: 'absolute', textTransform: 'uppercase', letterSpacing: '1px' }}>
            or login with email
          </span>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '12px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', border: '1px solid #fee2e2' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Work email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jane@company.com"
              style={{ width: '100%', boxSizing: 'border-box', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Password</label>
              <Link href="/login/client/forgot-password" style={{ fontSize: '12px', color: '#6382ff', textDecoration: 'none', fontWeight: '500' }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', boxSizing: 'border-box', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              backgroundColor: '#ffffff', 
              border: '1px solid #f3f4f6', 
              padding: '16px', 
              borderRadius: '16px', 
              fontWeight: 'bold', 
              fontSize: '15px', 
              color: '#111827',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              marginTop: '8px',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>
            No account yet?{' '}
            <Link href="/signup/client" style={{ color: '#111827', fontWeight: 'bold', textDecoration: 'none' }}>
              Register your company
            </Link>
          </p>
        </div>
      </div>

      <Link href="/" style={{ marginTop: '40px', fontSize: '14px', color: '#9ca3af', textDecoration: 'none' }}>
        ← Back to home
      </Link>
    </div>
  )
}
