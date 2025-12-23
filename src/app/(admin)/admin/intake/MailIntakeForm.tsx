'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Customer = { id: string; firstName: string; lastName: string; email: string };

export function MailIntakeForm({ customers }: { customers: Customer[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ userId: '', sender: '', type: 'LETTER' });

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess('');
        try {
                const res = await fetch('/api/admin/mail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
                if (!res.ok) throw new Error((await res.json()).error || 'Failed');
                setSuccess('Mail item logged!');
                setFormData({ userId: '', sender: '', type: 'LETTER' });
                router.refresh();
        } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed');
        } finally { setLoading(false); }
  };

  return (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600">{error}</div>div>}
          {success && <div className="text-green-600">{success}</div>div>}
              <div>
                      <label className="block text-sm font-medium text-gray-700">Customer *</label>label>
                      <select required value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3">
                                <option value="">Select customer...</option>option>
                        {customers.map((c) => <option key={c.id} value={c.id}>{c.lastName}, {c.firstName}</option>option>)}
                      </select>select>
              </div>div>
              <div>
                      <label className="block text-sm font-medium text-gray-700">Sender</label>label>
                      <input type="text" value={formData.sender} onChange={(e) => setFormData({...formData, sender: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" placeholder="e.g. IRS"/>
              </div>div>
              <div>
                      <label className="block text-sm font-medium text-gray-700">Type *</label>label>
                      <select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3">
                                <option value="LETTER">Letter</option>option>
                                <option value="PACKAGE">Package</option>option>
                                <option value="MAGAZINE">Magazine</option>option>
                      </select>select>
              </div>div>
              <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Logging...' : 'Log Mail Item'}
              </button>button>
        </form>form>
      );
}</form>
