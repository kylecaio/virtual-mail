import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
          const session = await getServerSession(authOptions);
          if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

      const { status } = await request.json();
          if (!status) return NextResponse.json({ error: 'Missing status' }, { status: 400 });

      const updatedRequest = await db.request.update({
              where: { id: params.id },
              data: { status, completedAt: status === 'COMPLETED' ? new Date() : null },
      });

      if (status === 'COMPLETED' && updatedRequest.mailItemId) {
              const statusMap: Record<string, string> = { SCAN: 'SCANNED', SHRED: 'SHREDDED', FORWARD: 'FORWARDED' };
              const newStatus = statusMap[updatedRequest.type];
              if (newStatus) await db.mailItem.update({ where: { id: updatedRequest.mailItemId }, data: { status: newStatus } });
      }

      return NextResponse.json({ message: 'Updated', request: updatedRequest });
    } catch (error) {
          return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
