#!/usr/bin/env node

/**
 * Recurring Notifications Cron Job
 *
 * This script checks for upcoming recurring transactions and sends notifications
 * 3 days in advance. Run this script periodically (e.g., daily) using a cron job
 * or task scheduler.
 *
 * Usage:
 * node scripts/check-recurring-notifications.js
 *
 * For cron job (run daily at 9 AM):
 * 0 9 * * * cd /path/to/your/app && node scripts/check-recurring-notifications.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecurringNotifications() {
  try {
    console.log('Checking for upcoming recurring transactions...');

    // Calculate 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Find all active recurring entries due in the next 3 days
    const upcomingEntries = await prisma.recurringEntry.findMany({
      where: {
        nextDue: {
          lte: threeDaysFromNow,
          gte: new Date(), // Not past due
        },
        isActive: true,
      },
      include: {
        expense: true,
        income: true,
        user: true,
      },
    });

    console.log(`Found ${upcomingEntries.length} upcoming recurring entries`);

    // Create notifications for each upcoming entry
    for (const entry of upcomingEntries) {
      // Check if notification already exists for this entry in the last 24 hours
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: entry.userId,
          type: 'recurring_reminder',
          recurringEntryId: entry.id,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      if (!existingNotification) {
        // Determine the entry type and details
        let entryType = 'Unknown';
        let entryDetails = '';
        let amount = 0;

        if (entry.expense) {
          entryType = 'Expense';
          entryDetails = `${entry.expense.category.charAt(0).toUpperCase() + entry.expense.category.slice(1)} expense`;
          amount = entry.expense.amount;
        } else if (entry.income) {
          entryType = 'Income';
          entryDetails = `${entry.income.source.charAt(0).toUpperCase() + entry.income.source.slice(1)} income`;
          amount = entry.income.amount;
        }

        const message = `Upcoming ${entry.frequency} ${entryType.toLowerCase()}: ${entryDetails} of ₹${amount.toLocaleString()} is due on ${new Date(entry.nextDue).toLocaleDateString()}`;

        await prisma.notification.create({
          data: {
            userId: entry.userId,
            message,
            type: 'recurring_reminder',
            recurringEntryId: entry.id,
            isRead: false,
          },
        });

        console.log(`Created notification for user ${entry.userId}: ${message}`);
      } else {
        console.log(`Notification already exists for entry ${entry.id}`);
      }
    }

    console.log('Recurring notifications check completed successfully');
  } catch (error) {
    console.error('Error checking recurring notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkRecurringNotifications();