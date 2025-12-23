import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
    try {
          const session = await getServerSession(authOptions);

      if (!session?.user || !['ADMIN', 'STAFF'].includes((session.user as any).role)) {
              return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const configs = await db.pricingConfig.findMany();
          const pricing: Record<string, number> = {};
          configs.forEach((config) => {
                  pricing[config.key] = config.value;
          });

      return NextResponse.json(pricing);
    } catch (error) {
          return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
          const session = await getServerSession(authOptions);

      if (!session?.user || (session.user as any).role !== 'ADMIN') {
              return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
      }

      const pricing = await request.json();

      const updates = Object.entries(pricing).map(async ([key, value]) => {
              return db.pricingConfig.upsert({
                        where: { key },
                        update: { value: value as number, updatedBy: session.user?.email || undefined },
                        create: { key, value: value as number, description: key, updatedBy: session.user?.email || undefined },
              });
      });

      await Promise.all(updates);

      return NextResponse.json({ success: true });
    } catch (error) {
          return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
