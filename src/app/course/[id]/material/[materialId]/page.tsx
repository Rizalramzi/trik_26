'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import QuizRunner from '../../../../../components/QuizRunner';
import Link from 'next/link';

interface Material {
  id: string;
  course_id: string;
  title: string;
  content_text: string;
}

interface Question {
  question_text: string;
  options: string[];
  correct_option: number;
}

export default function MaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string; materialId: string }>;
}) {
  const resolvedParams = use(params);
  const [material, setMaterial] = useState<Material | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizActive, setQuizActive] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      const { data } = await supabase
        .from('materials')
        .select('*')
        .eq('id', resolvedParams.materialId)
        .single();

      if (data) setMaterial(data);
    };

    fetchMaterial();
  }, [resolvedParams.materialId]);

  const handleGenerateQuiz = async () => {
    if (!material) return;
    setLoadingQuiz(true);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialText: material.content_text }),
      });

      const data = await res.json();
      if (res.ok && data.questions) {
        setQuestions(data.questions);
        setQuizActive(true);
      } else {
        alert('Gagal membuat kuis: ' + (data.error || 'Terjadi kesalahan'));
      }
    } catch (err: unknown) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Terjadi kesalahan'));
    } finally {
      setLoadingQuiz(false);
    }
  };

  if (!material) {
    return <div className="p-8 text-center text-gray-500">Memuat materi...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link
        href={`/course/${resolvedParams.id}`}
        className="text-sm text-blue-600 font-medium hover:underline"
      >
        &larr; Kembali ke Daftar Materi
      </Link>

      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold">{material.title}</h1>
        {!quizActive && (
          <button
            onClick={handleGenerateQuiz}
            disabled={loadingQuiz}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loadingQuiz ? 'Membuat Kuis...' : '⚡ Mulai Kuis AI'}
          </button>
        )}
      </div>

      {/* Mode Kuis Interaktif */}
      {quizActive ? (
        <div className="bg-gray-50 p-6 rounded-xl border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Kuis Evaluasi Materi</h2>
            <button
              onClick={() => setQuizActive(false)}
              className="text-xs text-gray-500 hover:underline"
            >
              Tutup Kuis / Kembali ke Bacaan
            </button>
          </div>
          <QuizRunner
            materialId={material.id}
            questions={questions}
            onComplete={() => setQuizActive(false)}
          />
        </div>
      ) : (
        /* Tampilan Konten Materi Markdown */
        <article className="prose lg:prose-xl bg-white p-6 rounded-xl border shadow-sm max-w-none">
          <ReactMarkdown>{material.content_text}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}