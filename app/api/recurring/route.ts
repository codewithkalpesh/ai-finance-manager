import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenPayload = await verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const recurringEntries = await prisma.recurringEntry.findMany({
      where: {
        userId: tokenPayload.userId,
        isActive: true,
      },
      include: {
        expense: true,
        income: true,
      },
      orderBy: { nextDue: 'asc' },
    });

    return NextResponse.json({ entries: recurringEntries });
  } catch (error) {
    console.error('Error fetching recurring entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenPayload = await verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { entryId } = await request.json();

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    // Verify the entry belongs to the user before deactivating
    const entry = await prisma.recurringEntry.findFirst({
      where: {
        id: entryId,
        userId: tokenPayload.userId,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    await prisma.recurringEntry.update({
      where: { id: entryId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: 'Recurring entry deactivated' });
  } catch (error) {
    console.error('Error managing recurring entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}