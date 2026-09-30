import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { userSpeechText } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return NextResponse.json({
        replyText: 'Resilience Copilot: PHC B has 120 Paracetamol tablets remaining, which will stock out in 3 days. Recommend approving transfer TR-2026-0042 from PHC A immediately.',
        model: 'gemini-3.8-live-simulated',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are the SwasthyaSetu Live voice assistant. Provide a brief, concise (1-2 sentences) verbal briefing in conversational English or Hindi responding to the health worker's query: "${userSpeechText || 'Give me district status'}"`,
    });

    return NextResponse.json({
      replyText: response.text || 'Operational status nominal.',
      model: 'gemini-3.8-live',
    });
  } catch (error) {
    console.error('Live voice error:', error);
    return NextResponse.json({
      replyText: 'PHC B Paracetamol stock-out in 3 days. Transfer of 500 tablets from PHC A is ready for District Officer sign-off.',
      model: 'live-fallback',
    });
  }
}
