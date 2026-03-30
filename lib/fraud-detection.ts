import { prisma } from './prisma';

export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  similarExpenses: { amount: number; date: string; category: string }[];
}

// Detect anomalies in expense
export async function detectExpenseAnomaly(
  userId: string,
  amount: number,
  category: string,
  date: Date
): Promise<AnomalyDetectionResult> {
  // Get recent similar expenses from last 3 months
  const threeMonthsAgo = new Date(date);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const similarExpenses = await prisma.expense.findMany({
    where: {
      userId,
      category,
      date: {
        gte: threeMonthsAgo,
        lte: date,
      },
    },
    select: {
      amount: true,
      date: true,
      category: true,
    },
  });

  if (similarExpenses.length === 0) {
    return {
      isAnomaly: false,
      severity: 'low',
      reason: 'No historical data for comparison',
      similarExpenses: [],
    };
  }

  // Calculate statistics
  const amounts = similarExpenses.map((e) => e.amount);
  const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - average, 2), 0) / amounts.length);
  const zScore = (amount - average) / stdDev;

  // Detect anomalies
  let isAnomaly = false;
  let severity: 'low' | 'medium' | 'high' = 'low';
  let reason = '';

  if (zScore > 3) {
    isAnomaly = true;
    severity = 'high';
    reason = `This expense is ${((amount / average) * 100 - 100).toFixed(0)}% higher than your average spending in this category`;
  } else if (zScore > 2) {
    isAnomaly = true;
    severity = 'medium';
    reason = `This expense is ${((amount / average) * 100 - 100).toFixed(0)}% higher than your average spending in this category`;
  } else if (zScore > 1.5) {
    isAnomaly = true;
    severity = 'low';
    reason = `This is slightly higher than your usual spending in this category`;
  }

  return {
    isAnomaly,
    severity,
    reason,
    similarExpenses: similarExpenses.slice(-5).map(expense => ({
      ...expense,
      date: expense.date.toISOString().split('T')[0], // Convert Date to string
    })),
  };
}

// Create anomaly alert
export async function createAnomalyAlert(
  userId: string,
  expenseId: string,
  alertType: string,
  severity: string,
  message: string
) {
  return prisma.anomalyAlert.create({
    data: {
      userId,
      expenseId,
      alertType,
      severity,
      message,
    },
  });
}

// Get unresolved alerts for user
export async function getUnresolvedAlerts(userId: string) {
  return prisma.anomalyAlert.findMany({
    where: {
      userId,
      isResolved: false,
    },
    include: {
      expense: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// Resolve alert
export async function resolveAlert(alertId: string) {
  return prisma.anomalyAlert.update({
    where: { id: alertId },
    data: { isResolved: true },
  });
}
