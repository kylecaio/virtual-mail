import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
    try {
          const session = await getServerSession(authOptions);
          if (!session?.user) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

      const user = await db.user.findUnique({
              where: { id: (session.user as any).id },
              select: { id: true, name: true, email: true, phone: true, createdAt: true },
      });

      return NextResponse.json(user);
    } catch (error) {
          return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
          const session = await getServerSession(authOptions);
          if (!session?.user) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

      const { name, phone } = await request.json();

      const updatedUser = await db.user.update({
              where: { id: (session.user as any).id },
              data: { name: name || undefined, phone: phone || undefined },
              select: { id: true, name: true, email: true, phone: true },
      });

      return NextResponse.json(updatedUser);
    } catch (error) {
          return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
