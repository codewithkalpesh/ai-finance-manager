import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { detectExpenseAnomaly, createAnomalyAlert } from '@/lib/fraud-detection';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenPayload = verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { amount, category, description, date, receiptImage, isRecurring, frequency, tags } = await request.json();

    if (!amount || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for anomalies
    const anomalyResult = await detectExpenseAnomaly(
      tokenPayload.userId,
      parseFloat(amount),
      category,
      new Date(date)
    );

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        userId: tokenPayload.userId,
        amount: parseFloat(amount),
        category,
        description: description || `${category} expense`,
        date: new Date(date),
        receiptImage: receiptImage || null,
        isAnomaly: anomalyResult.isAnomaly,
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
          expenseId: expense.id,
          frequency,
          nextDue,
          isActive: true,
        },
      });
    }

    // Create alert if anomaly detected
    if (anomalyResult.isAnomaly) {
      await createAnomalyAlert(
        tokenPayload.userId,
        expense.id,
        'unusual_amount',
        anomalyResult.severity,
        anomalyResult.reason
      );
    }

    // Update user balance
    await prisma.user.update({
      where: { id: tokenPayload.userId },
      data: {
        totalBalance: {
          decrement: parseFloat(amount),
        },
      },
    });

    return NextResponse.json({
      success: true,
      expense,
      anomalyDetected: anomalyResult.isAnomaly,
      anomalyMessage: anomalyResult.reason,
    });
  } catch (error) {
    console.error('Add expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenPayload = verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const expenses = await prisma.expense.findMany({
      where: { userId: tokenPayload.userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
