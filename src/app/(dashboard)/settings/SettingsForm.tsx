'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
}

export default function SettingsForm({ user }: { user: User | null }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
          name: user?.name || '',
          phone: user?.phone || '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
                const res = await fetch('/api/user/profile', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(formData),
                });

          if (res.ok) {
                    setMessage('Profile updated successfully!');
                    router.refresh();
          } else {
                    setMessage('Failed to update profile.');
          }
        } catch (error) {
                setMessage('Error updating profile.');
        } finally {
                setSaving(false);
        }
  };

  return (
        <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>label>
                      <input
                                  type="text"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
              </div>div>
              <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>label>
                      <input type="email" value={user?.email || ''} disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100" />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>p>
              </div>div>
              <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>label>
                      <input
                                  type="tel"
                                  value={formData.phone}
                                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
              </div>div>
          {message && <div className={`p-3 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>div>}
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>button>
        </form>form>
      );
}</form>
