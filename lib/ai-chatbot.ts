import { OpenAI } from 'openai';
import { prisma } from './prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FinancialContext {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  topCategories: { category: string; amount: number }[];
  savingsGoals: { title: string; progress: number; target: number }[];
}

// Get user's financial context for chatbot
export async function getFinancialContext(userId: string): Promise<FinancialContext> {
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
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Calculate monthly expenses by category
  const expensesByCategory: { [key: string]: number } = {};
  user.expenses.forEach((expense) => {
    expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
  });

  const topCategories = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const monthlyExpenses = user.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return {
    totalBalance: user.totalBalance,
    monthlyIncome: user.monthlyIncome,
    monthlyExpenses,
    topCategories,
    savingsGoals: user.goals.map((goal) => ({
      title: goal.title,
      progress: goal.currentAmount,
      target: goal.targetAmount,
    })),
  };
}

// AI Financial Chatbot
export async function askFinancialChatbot(userId: string, question: string): Promise<string> {
  try {
    const context = await getFinancialContext(userId);

    const systemPrompt = `You are a helpful financial advisor chatbot. Use the following financial data to answer user questions:
    
    Total Balance: ${context.totalBalance}
    Monthly Income: ${context.monthlyIncome}
    Monthly Expenses: ${context.monthlyExpenses}
    Monthly Savings: ${context.monthlyIncome - context.monthlyExpenses}
    Top Spending Categories: ${context.topCategories.map((c) => `${c.category} (₹${c.amount})`).join(', ')}
    Savings Goals: ${context.savingsGoals.map((g) => `${g.title}: ₹${g.progress}/${g.target}`).join(', ')}
    
    Provide helpful insights and recommendations based on the user's financial data. Be friendly and supportive.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = response.choices[0].message.content || 'Unable to generate response';

    // Save chat message
    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'assistant',
        content: answer,
      },
    });

    return answer;
  } catch (error) {
    console.error('Chatbot error:', error);
    throw error;
  }
}

// Get financial insights
export async function generateFinancialInsights(userId: string): Promise<string[]> {
  const context = await getFinancialContext(userId);
  const insights: string[] = [];

  // Insight 1: Spending analysis
  if (context.monthlyExpenses > context.monthlyIncome * 0.8) {
    insights.push(
      `⚠️ Your expenses (₹${context.monthlyExpenses}) are consuming ${((context.monthlyExpenses / context.monthlyIncome) * 100).toFixed(0)}% of your income. Consider reducing discretionary spending.`
    );
  } else {
    const savingRate = ((1 - context.monthlyExpenses / context.monthlyIncome) * 100).toFixed(0);
    insights.push(`✅ Great! You're saving ${savingRate}% of your monthly income.`);
  }

  // Insight 2: Top spending category
  if (context.topCategories.length > 0) {
    const topCategory = context.topCategories[0];
    insights.push(
      `📊 Your top spending category is ${topCategory.category} at ₹${topCategory.amount.toFixed(2)} this month.`
    );
  }

  // Insight 3: Savings goals progress
  context.savingsGoals.forEach((goal) => {
    const progress = (goal.progress / goal.target) * 100;
    insights.push(`🎯 ${goal.title}: ${progress.toFixed(0)}% complete (₹${goal.progress}/${goal.target})`);
  });

  return insights;
}
