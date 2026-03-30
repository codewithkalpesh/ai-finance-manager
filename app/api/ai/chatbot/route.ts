import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthMiddleware } from '@/lib/auth';
import { askFinancialChatbot, generateFinancialInsights } from '@/lib/ai-chatbot';

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuthMiddleware(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await askFinancialChatbot(payload.userId, message);

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Failed to get response' },
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

    const insights = await generateFinancialInsights(payload.userId);

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
