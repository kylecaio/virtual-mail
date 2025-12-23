'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const result = await signIn('credentials', { email: formData.get('email'), password: formData.get('password'), redirect: false })
        if (result?.error) { setError('Invalid email or password'); setLoading(false) }
        else { router.push('/dashboard') }
  }

  return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
                      <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>h1>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>p>}
                                <input name="email" type="email" placeholder="Email" required className="w-full p-3 border rounded" />
                                <input name="password" type="password" placeholder="Password" required className="w-full p-3 border rounded" />
                                <button type="submit" disabled={loading} className="w-full p-3 bg-blue-600 text-white rounded">{loading ? 'Signing in...' : 'Sign In'}</button>button>
                      </form>form>
                      <p className="text-center mt-4">Don't have an account? <Link href="/register" className="text-blue-600">Register</Link>Link></p>p>
              </div>div>
        </div>div>
      )
}</div>
