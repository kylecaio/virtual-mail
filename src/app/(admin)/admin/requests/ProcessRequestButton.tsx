'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ProcessRequestButton({ requestId }: { requestId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
        if (!confirm('Mark this request as completed?')) return;
        setLoading(true);
        try {
                const res = await fetch(`/api/admin/requests/${requestId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'COMPLETED' }) });
                if (!res.ok) throw new Error('Failed');
                router.refresh();
        } catch (err) {
                alert('Failed to process');
        } finally { setLoading(false); }
  };

  return (
        <button onClick={handleProcess} disabled={loading} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Processing...' : 'Complete'}
        </button>button>
      );
}</button>
