import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthMiddleware } from '@/lib/auth';
import { getInvestmentRecommendations, calculateSIPMaturity } from '@/lib/investment-engine';

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuthMiddleware(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    const recommendations = await getInvestmentRecommendations(payload.userId);

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuthMiddleware(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    const { monthlyAmount, months, annualReturn } = await request.json();

    if (!monthlyAmount || !months || !annualReturn) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = calculateSIPMaturity(monthlyAmount, months, annualReturn);

    return NextResponse.json({
      success: true,
      sipCalculation: result,
    });
  } catch (error) {
    console.error('SIP calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate' },
      { status: 500 }
    );
  }
}
