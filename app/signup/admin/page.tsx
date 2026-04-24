'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'


export default function AdminSignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { role: 'admin' } }
    })
    if (error) alert(error.message)
    else alert('Master Admin account created!')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">System Admin Portal</h1>
      <div className="flex flex-col gap-2 bg-gray-800 p-6 shadow rounded">
        <input type="email" placeholder="Admin Email" className="border p-2 text-black" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Admin Password" className="border p-2 text-black" onChange={e => setPassword(e.target.value)} />
        <button onClick={handleSignUp} className="bg-red-600 text-white p-2 rounded">Create Admin</button>
      </div>
    </div>
  )
}
