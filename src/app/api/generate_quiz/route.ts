import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY belum dikonfigurasi' }, { status: 500 });
    }

    const body = await req.json();
    const materialText = typeof body.materialText === 'string' ? body.materialText.trim() : '';
    if (!materialText) {
      return NextResponse.json({ error: 'materialText wajib diisi' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Minta Gemini mengembalikan JSON sesuai skema kuis
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Buatkan 5 soal pilihan ganda berdasarkan materi berikut:\n\n${materialText}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question_text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correct_option: { 
                type: Type.INTEGER, 
                description: 'Indeks berbasis 0 untuk jawaban yang benar (0-3)' 
              },
            },
            required: ['question_text', 'options', 'correct_option'],
          },
        },
      },
    });

    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error('Gemini tidak mengembalikan soal kuis');
    }

    const quizQuestions = JSON.parse(responseText);
    return NextResponse.json({ questions: quizQuestions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat kuis';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}