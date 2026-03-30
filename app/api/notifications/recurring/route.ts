import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // This endpoint should be called by a cron job or scheduled task
    // Check for recurring entries due in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const upcomingEntries = await prisma.recurringEntry.findMany({
      where: {
        nextDue: {
          lte: threeDaysFromNow,
          gte: new Date(),
        },
        isActive: true,
      },
      include: {
        expense: true,
        income: true,
        user: true,
      },
    });

    // Create notifications for upcoming entries
    for (const entry of upcomingEntries) {
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: entry.userId,
          recurringEntryId: entry.id,
          type: 'recurring_reminder',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      if (!existingNotification) {
        const isExpense = !!entry.expense;
        const transaction = isExpense ? entry.expense : entry.income;
        const type = isExpense ? 'expense' : 'income';

        await prisma.notification.create({
          data: {
            userId: entry.userId,
            title: `Upcoming ${type}`,
            message: `Your recurring ${type} of ₹${transaction?.amount} is due on ${entry.nextDue.toDateString()}`,
            type: 'recurring_reminder',
            recurringEntryId: entry.id,
            link: isExpense ? '/dashboard/expenses' : '/dashboard/incomes',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      notificationsCreated: upcomingEntries.length,
    });
  } catch (error) {
    console.error('Error checking recurring notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}