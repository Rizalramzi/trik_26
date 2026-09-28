'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Question {
  question_text: string;
  options: string[];
  correct_option: number;
}

interface QuizRunnerProps {
  materialId: string;
  questions: Question[];
  onComplete: () => void;
}

export default function QuizRunner({ materialId, questions, onComplete }: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    new Array(questions.length).fill(-1)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    const updated = [...selectedAnswers];
    updated[currentIndex] = optionIndex;
    setSelectedAnswers(updated);
  };

  const handleSubmitQuiz = async () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_option) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);

    // Simpan hasil ke Supabase
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      // 1. Catat percobaan kuis
      await supabase.from('quiz_attempts').insert({
        user_id: userData.user.id,
        score: calculatedScore,
      });

      // 2. Tandai materi selesai jika skor >= 70
      if (calculatedScore >= 70) {
        await supabase.from('user_progress').upsert({
          user_id: userData.user.id,
          material_id: materialId,
          is_completed: true,
          last_accessed: new Date().toISOString(),
        });
      }
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6">
      {!isSubmitted ? (
        <>
          {/* Indikator Nomor Soal */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Soal {currentIndex + 1} dari {questions.length}</span>
          </div>

          {/* Teks Pertanyaan */}
          <h3 className="text-lg font-semibold text-gray-900">{currentQ.question_text}</h3>

          {/* Opsi Jawaban */}
          <div className="space-y-2">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                  selectedAnswers[currentIndex] === idx
                    ? 'border-indigo-600 bg-indigo-50 font-medium text-indigo-900'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
              </button>
            ))}
          </div>

          {/* Navigasi Soal */}
          <div className="flex justify-between pt-4">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40"
            >
              Sebelumnya
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                disabled={selectedAnswers.includes(-1)}
                onClick={handleSubmitQuiz}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Kirim Jawaban
              </button>
            ) : (
              <button
                disabled={selectedAnswers[currentIndex] === -1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50"
              >
                Selanjutnya
              </button>
            )}
          </div>
        </>
      ) : (
        /* Tampilan Hasil Skor */
        <div className="text-center space-y-4 py-4">
          <div className="inline-block p-4 bg-white rounded-full border shadow-sm">
            <span className="text-4xl font-extrabold text-indigo-600">{score}</span>
            <span className="text-gray-400 text-sm"> / 100</span>
          </div>
          <h3 className="text-xl font-bold">
            {score >= 70 ? '🎉 Selamat! Anda Lulus Kuis' : '📚 Silakan Pelajari Materi Kembali'}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {score >= 70
              ? 'Materi ini telah otomatis ditandai "Selesai" di Learning Journey Anda.'
              : 'Skor minimal untuk menyelesaikan materi ini adalah 70.'}
          </p>
          <button
            onClick={onComplete}
            className="mt-4 px-6 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
          >
            Selesai & Kembali ke Materi
          </button>
        </div>
      )}
    </div>
  );
}