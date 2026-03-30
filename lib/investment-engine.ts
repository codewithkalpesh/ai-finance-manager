import { prisma } from './prisma';

export interface InvestmentRecommendation {
  type: string;
  name: string;
  expectedReturn: number;
  riskLevel: string;
  description: string;
  reason: string;
}

// Analyze user profile and recommend investments
export async function getInvestmentRecommendations(userId: string): Promise<InvestmentRecommendation[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      expenses: {
        where: {
          date: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      },
      goals: {
        where: { status: 'active' },
      },
      investments: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const monthlyExpenses = user.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyIncome = user.monthlyIncome;
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlySavings / monthlyIncome;

  // Determine risk profile
  let riskProfile = 'low';
  if (savingsRate > 0.3 && monthlySavings > 50000) {
    riskProfile = 'high';
  } else if (savingsRate > 0.15 && monthlySavings > 20000) {
    riskProfile = 'medium';
  }

  const recommendations: InvestmentRecommendation[] = [];

  // Low risk recommendations
  recommendations.push({
    type: 'debt',
    name: 'Debt Funds',
    expectedReturn: 5.5,
    riskLevel: 'low',
    description: 'Conservative investment with low volatility',
    reason: 'Stable returns suitable for emergency fund or short-term goals',
  });

  recommendations.push({
    type: 'fixed-deposit',
    name: 'Fixed Deposits',
    expectedReturn: 6.5,
    riskLevel: 'low',
    description: 'Safe, insured by DICGC up to ₹5 lakh',
    reason: 'Ideal for capital preservation',
  });

  // Medium risk recommendations
  if (riskProfile === 'medium' || riskProfile === 'high') {
    recommendations.push({
      type: 'balanced-fund',
      name: 'Balanced Mutual Funds',
      expectedReturn: 9,
      riskLevel: 'medium',
      description: 'Mix of equity and debt for balanced growth',
      reason: 'Good for long-term wealth creation with moderate risk',
    });

    recommendations.push({
      type: 'sip',
      name: 'Systematic Investment Plan (SIP)',
      expectedReturn: 11,
      riskLevel: 'medium',
      description: 'Regular investment in mutual funds',
      reason: `With monthly savings of ₹${monthlySavings.toFixed(0)}, SIP can help build wealth`,
    });
  }

  // High risk recommendations
  if (riskProfile === 'high') {
    recommendations.push({
      type: 'equity',
      name: 'Equity Funds',
      expectedReturn: 13,
      riskLevel: 'high',
      description: 'Growth-oriented investment in stock market',
      reason: 'Suitable for long-term goals and wealth accumulation',
    });

    recommendations.push({
      type: 'index-fund',
      name: 'Index Funds',
      expectedReturn: 12,
      riskLevel: 'high',
      description: 'Diversified portfolio tracking market indices',
      reason: 'Low-cost, diversified approach to equity investing',
    });
  }

  return recommendations;
}

// Calculate SIP maturity
export function calculateSIPMaturity(
  monthlyAmount: number,
  months: number,
  annualReturn: number
): { totalInvested: number; totalReturn: number; maturityAmount: number } {
  const monthlyReturn = annualReturn / 100 / 12;
  let maturityAmount = 0;

  for (let i = 1; i <= months; i++) {
    maturityAmount += monthlyAmount * Math.pow(1 + monthlyReturn, months - i + 1);
  }

  const totalInvested = monthlyAmount * months;
  const totalReturn = maturityAmount - totalInvested;

  return {
    totalInvested,
    totalReturn,
    maturityAmount: Math.round(maturityAmount),
  };
}

// Save investment recommendation
export async function saveInvestmentRecommendation(
  userId: string,
  recommendation: InvestmentRecommendation
) {
  return prisma.investment.create({
    data: {
      userId,
      name: recommendation.name,
      type: recommendation.type,
      amount: 0, // User will set this
      expectedReturn: recommendation.expectedReturn,
      riskLevel: recommendation.riskLevel,
      recommended: true,
      recommendationReason: recommendation.reason,
    },
  });
}
