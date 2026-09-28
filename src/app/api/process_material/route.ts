import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;

    if (!file || !courseId) {
      return NextResponse.json({ error: 'File dan courseId wajib diisi' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let extractedText = '';

    // 1. Ekstraksi teks berdasarkan tipe file
    if (file.type === 'application/pdf') {
      const pdfParser = new PDFParse({ data: buffer });
      const pdfData = await pdfParser.getText();
      extractedText = pdfData.text;
      await pdfParser.destroy();
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const docxData = await mammoth.extractRawText({ buffer });
      extractedText = docxData.value;
    } else {
      // Fallback teks biasa jika TXT
      extractedText = buffer.toString('utf-8');
    }

    // 2. Olah Teks Menggunakan Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Kamu adalah asisten akademis. Ubah dan rangkum materi mentah berikut menjadi materi kuliah yang terstruktur rapi, mudah dibaca, dan komprehensif menggunakan format Markdown (sertakan Ringkasan, Poin-Poin Kunci, dan Penjelasan Detail):\n\n${extractedText}`,
    });

    const formattedContent = response.text;

    return NextResponse.json({
      title: file.name.replace(/\.[^/.]+$/, ''),
      content: formattedContent,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses materi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}