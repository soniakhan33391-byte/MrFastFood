import React, { useState } from 'react'
import { useStore } from '../store/Store'
import { UtensilsCrossed } from 'lucide-react'

export default function Login() {
  const { login } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  function submit(e) {
    e.preventDefault()
    const u = username.trim()
    const p = password.trim()
    if (!u || !p) {
      setErr('Please enter username and password')
      return
    }
    // FIX - Yaha se password hint hata diya
    if (!login(u, p)) {
      setErr('Invalid username or password')
    } else {
      setErr('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-3">
            <UtensilsCrossed className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Mr Fast Food</h1>
          <p className="text-gray-500 text-sm">Mardan - POS System</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              autoFocus 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none" 
              placeholder="Enter username" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none" 
              placeholder="Enter password" 
            />
          </div>
          {err && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded p-2">{err}</p>}
          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition">Login</button>
        </form>
        {/* FIX - Neeche wala admin/cashier wala box hata diya */}
        <p className="text-xs text-gray-400 mt-6 text-center">Secure Login • Authorized Staff Only</p>
      </div>
    </div>
  )
}