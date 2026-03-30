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

    const incomes = await prisma.income.findMany({
      where: { userId: tokenPayload.userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ incomes });
  } catch (error) {
    console.error('Error fetching incomes:', error);
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

    const { amount, source, description, date, isRecurring, frequency, tags } = await request.json();

    if (!amount || !source || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the income
    const income = await prisma.income.create({
      data: {
        userId: tokenPayload.userId,
        amount: parseFloat(amount),
        source,
        description,
        date: new Date(date),
        isRecurring: isRecurring || false,
        tags: tags || [],
      },
    });

    // If recurring, create recurring entry
    if (isRecurring && frequency) {
      const nextDue = calculateNextDue(new Date(date), frequency);

      await prisma.recurringEntry.create({
        data: {
          userId: tokenPayload.userId,
          incomeId: income.id,
          frequency,
          nextDue,
          isActive: true,
        },
      });
    }

    // Update user's total balance
    await prisma.user.update({
      where: { id: tokenPayload.userId },
      data: {
        totalBalance: {
          increment: parseFloat(amount),
        },
      },
    });

    return NextResponse.json({
      success: true,
      income,
    });
  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateNextDue(startDate: Date, frequency: string): Date {
  const nextDue = new Date(startDate);

  switch (frequency) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;
    case 'yearly':
      nextDue.setFullYear(nextDue.getFullYear() + 1);
      break;
    default:
      nextDue.setMonth(nextDue.getMonth() + 1); // Default to monthly
  }

  return nextDue;
}