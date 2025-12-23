'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          company: '',
          phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
        }

        if (formData.password.length < 8) {
                setError('Password must be at least 8 characters');
                return;
        }

        setLoading(true);

        try {
                const res = await fetch('/api/auth/register', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                                      email: formData.email,
                                      password: formData.password,
                                      firstName: formData.firstName,
                                      lastName: formData.lastName,
                                      company: formData.company || undefined,
                                      phone: formData.phone || undefined,
                          }),
                });

          const data = await res.json();

          if (!res.ok) {
                    throw new Error(data.error || 'Registration failed');
          }

          router.push('/login?registered=true');
        } catch (err) {
                setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
                setLoading(false);
        }
  };

  return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
              <div className="max-w-md w-full space-y-8">
                      <div>
                                <h1 className="text-center text-3xl font-bold text-gray-900">
                                            BIG Oakland Virtual Mail
                                </h1>h1>
                                <h2 className="mt-2 text-center text-xl text-gray-600">
                                            Create your account
                                </h2>h2>
                      </div>div>
              
                      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>div>
                                )}
                      
                                <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                          <div>
                                                                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                                                                            First Name *
                                                                          </label>label>
                                                                          <input
                                                                                              id="firstName"
                                                                                              name="firstName"
                                                                                              type="text"
                                                                                              required
                                                                                              value={formData.firstName}
                                                                                              onChange={handleChange}
                                                                                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                                            />
                                                          </div>div>
                                                          <div>
                                                                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                                                                            Last Name *
                                                                          </label>label>
                                                                          <input
                                                                                              id="lastName"
                                                                                              name="lastName"
                                                                                              type="text"
                                                                                              required
                                                                                              value={formData.lastName}
                                                                                              onChange={handleChange}
                                                                                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                                            />
                                                          </div>div>
                                            </div>div>
                                
                                            <div>
                                                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                                          Email Address *
                                                          </label>label>
                                                          <input
                                                                            id="email"
                                                                            name="email"
                                                                            type="email"
                                                                            required
                                                                            value={formData.email}
                                                                            onChange={handleChange}
                                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                          />
                                            </div>div>
                                
                                            <div>
                                                          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                                                                          Company (Optional)
                                                          </label>label>
                                                          <input
                                                                            id="company"
                                                                            name="company"
                                                                            type="text"
                                                                            value={formData.company}
                                                                            onChange={handleChange}
                                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                          />
                                            </div>div>
                                
                                            <div>
                                                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                                                          Phone (Optional)
                                                          </label>label>
                                                          <input
                                                                            id="phone"
                                                                            name="phone"
                                                                            type="tel"
                                                                            value={formData.phone}
                                                                            onChange={handleChange}
                                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                          />
                                            </div>div>
                                
                                            <div>
                                                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                                          Password *
                                                          </label>label>
                                                          <input
                                                                            id="password"
                                                                            name="password"
                                                                            type="password"
                                                                            required
                                                                            value={formData.password}
                                                                            onChange={handleChange}
                                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                          />
                                                          <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>p>
                                            </div>div>
                                
                                            <div>
                                                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                                                          Confirm Password *
                                                          </label>label>
                                                          <input
                                                                            id="confirmPassword"
                                                                            name="confirmPassword"
                                                                            type="password"
                                                                            required
                                                                            value={formData.confirmPassword}
                                                                            onChange={handleChange}
                                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                          />
                                            </div>div>
                                </div>div>
                      
                                <button
                                              type="submit"
                                              disabled={loading}
                                              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                  {loading ? 'Creating account...' : 'Create Account'}
                                </button>button>
                      
                                <p className="text-center text-sm text-gray-600">
                                            Already have an account?{' '}
                                            <Link href="/login" className="text-blue-600 hover:text-blue-500">
                                                          Sign in
                                            </Link>Link>
                                </p>p>
                      </form>form>
              </div>div>
        </div>div>
      );
}</div>
