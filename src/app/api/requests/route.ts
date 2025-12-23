import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const PRICES = { SCAN: 2.50, SHRED: 1.00, FORWARD: 3.00, PICKUP: 2.00 };

export async function POST(request: NextRequest) {
    try {
          const session = await getServerSession(authOptions);
          if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const { mailItemId, type } = await request.json();
          if (!mailItemId || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

      const mailItem = await db.mailItem.findUnique({ where: { id: mailItemId } });
          if (!mailItem || mailItem.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const newRequest = await db.request.create({
              data: {
                        userId: session.user.id,
                        mailItemId,
                        type,
                        status: 'PENDING',
                        amount: PRICES[type as keyof typeof PRICES] || 0,
              },
      });

      return NextResponse.json({ message: 'Created', request: newRequest }, { status: 201 });
    } catch (error) {
          return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
          const session = await getServerSession(authOptions);
          if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const requests = await db.request.findMany({
              where: { userId: session.user.id },
              include: { mailItem: true },
              orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(requests);
    } catch (error) {
          return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
