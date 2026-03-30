import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthMiddleware } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuthMiddleware(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    const { title, description, targetAmount, deadline, priority } = await request.json();

    if (!title || !targetAmount || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        userId: payload.userId,
        title,
        description: description || '',
        targetAmount,
        deadline: new Date(deadline),
        priority: priority || 'medium',
      },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuthMiddleware(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    const goals = await prisma.goal.findMany({
      where: { userId: payload.userId },
      orderBy: { deadline: 'asc' },
    });

    return NextResponse.json({ success: true, goals });
  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await verifyAuthMiddleware(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    const { goalId, currentAmount } = await request.json();

    if (!goalId || currentAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.update({
      where: { id: goalId },
      data: { currentAmount },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error('Update goal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
