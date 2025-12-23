'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ActionType = 'SCAN' | 'SHRED' | 'FORWARD' | 'PICKUP';

export function RequestActions({ mailItemId, status }: { mailItemId: string; status: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState<ActionType | null>(null);
    const [error, setError] = useState('');

  const handleAction = async (type: ActionType) => {
        setLoading(type);
        setError('');
        try {
                const res = await fetch('/api/requests', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ mailItemId, type }),
                });
                if (!res.ok) throw new Error((await res.json()).error || 'Failed');
                router.refresh();
        } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed');
        } finally {
                setLoading(null);
        }
  };

  const isDisabled = status === 'SHREDDED' || status === 'FORWARDED';

  return (
        <div>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>div>}
              <div className="flex flex-wrap gap-3">
                      <button onClick={() => handleAction('SCAN')} disabled={isDisabled || loading !== null}
                                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                        {loading === 'SCAN' ? 'Requesting...' : 'Request Scan - $2.50'}
                      </button>button>
                      <button onClick={() => handleAction('SHRED')} disabled={isDisabled || loading !== null}
                                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
                        {loading === 'SHRED' ? 'Requesting...' : 'Shred - $1.00'}
                      </button>button>
                      <button onClick={() => handleAction('FORWARD')} disabled={isDisabled || loading !== null}
                                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                        {loading === 'FORWARD' ? 'Requesting...' : 'Forward - $3.00+'}
                      </button>button>
                      <button onClick={() => handleAction('PICKUP')} disabled={isDisabled || loading !== null}
                                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
                        {loading === 'PICKUP' ? 'Requesting...' : 'Pickup - $2.00'}
                      </button>button>
              </div>div>
          {isDisabled && <p className="mt-4 text-sm text-gray-500">No further actions available.</p>p>}
        </div>div>
      );
}</div>
