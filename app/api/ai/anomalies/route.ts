import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthMiddleware } from '@/lib/auth';
import { getUnresolvedAlerts, resolveAlert } from '@/lib/fraud-detection';

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuthMiddleware(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    const alerts = await getUnresolvedAlerts(payload.userId);

    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const { alertId } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const result = await resolveAlert(alertId);

    return NextResponse.json({
      success: true,
      message: 'Alert resolved',
      alert: result,
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
