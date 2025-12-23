import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
          const session = await getServerSession(authOptions);
          if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

      const { userId, sender, type } = await request.json();
          if (!userId || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

      const mailItem = await db.mailItem.create({
              data: { userId, sender: sender || null, type, status: 'RECEIVED', receivedAt: new Date() },
      });

      return NextResponse.json({ message: 'Created', mailItem }, { status: 201 });
    } catch (error) {
          return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
          const session = await getServerSession(authOptions);
          if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

      const mailItems = await db.mailItem.findMany({
              include: { user: { select: { firstName: true, lastName: true } } },
              orderBy: { receivedAt: 'desc' },
              take: 100,
      });

      return NextResponse.json(mailItems);
    } catch (error) {
          return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
