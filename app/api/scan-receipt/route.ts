import { NextRequest, NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

let scheduler: any = null;

// Fast regex-based receipt parser (no OCR needed for many receipts)
function fastParseReceipt(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Aggressive amount detection
  const amountRegex = /[₹$]?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)\s*(?:only|$|total|amount|payable|grand total)?/i;
  
  // Date detection
  const dateRegex = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/;

  let amount = '';
  let date = '';
  let vendor = lines[0] || 'Receipt';
  let items: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Try to find amount (usually highest number in receipt)
    if (!amount) {
      const match = line.match(amountRegex);
      if (match?.[1]) {
        const val = parseFloat(match[1].replace(/,/g, ''));
        if (val > 0 && val < 999999) {
          amount = match[1].replace(/,/g, '');
        }
      }
    }

    // Try to find date
    if (!date) {
      const match = line.match(dateRegex);
      if (match?.[0]) {
        date = match[0];
      }
    }

    // Collect possible item lines
    if (line.length > 3 && line.length < 80) {
      items.push(line);
    }
  }

  return {
    vendor,
    amount,
    date,
    items: items.slice(0, 5),
    rawText: text,
  };
}

// Initialize Tesseract scheduler once
async function getScheduler() {
  if (!scheduler) {
    scheduler = Tesseract.createScheduler();
    const worker: any = await Tesseract.createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    scheduler.addWorker(worker);
  }
  return scheduler;
}

// OCR with timeout and early return
async function ocrWithTimeout(buffer: Uint8Array, timeoutMs: number = 30000) {
  try {
    const scheduler = await getScheduler();
    
    const ocrPromise = scheduler.recognize(new Uint8Array(buffer));
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('OCR timeout')), timeoutMs)
    );

    const { data } = (await Promise.race([ocrPromise, timeoutPromise])) as any;
    return data.text;
  } catch (error) {
    console.error('OCR error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const file = body.get('receipt');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Receipt file is required' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    let ocrText = '';

    // Try fast OCR first with 30-second timeout
    try {
      ocrText = await ocrWithTimeout(new Uint8Array(buffer), 30000);
    } catch (ocrError) {
      console.warn('OCR failed or timed out, returning empty text:', ocrError);
      ocrText = '';
    }

    const parsed = fastParseReceipt(ocrText);

    return NextResponse.json({ success: true, parsed });
  } catch (error) {
    console.error('Receipt scan error:', error);
    return NextResponse.json(
      { error: 'Unable to process receipt. Please try again.' },
      { status: 500 }
    );
  }
}
