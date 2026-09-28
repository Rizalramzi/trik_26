'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, CheckCircle, Award, TrendingUp } from 'lucide-react';

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  totalMaterials: number;
  completedMaterials: number;
  percentage: number;
}

interface QuizAttemptHistory {
  id: string;
  score: number;
  completedAt: string;
}

interface CourseRow {
  id: string;
  title: string;
  materials?: { id: string }[];
}

interface UserProgressRow {
  material_id: string;
  is_completed: boolean;
}

interface QuizAttemptRow {
  id: string;
  score: number;
  completed_at: string;
}

export default function LearningJourneyDashboard() {
  const [loading, setLoading] = useState(true);
  const [courseProgresses, setCourseProgresses] = useState<CourseProgress[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizAttemptHistory[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalCompletedMaterials: 0,
    avgQuizScore: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchLearningData = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      const userId = userData.user.id;

      // 1. Ambil data Mata Kuliah dan Materi
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, materials(id)');

      // 2. Ambil Progres Belajar Pengguna
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('material_id, is_completed')
        .eq('user_id', userId)
        .eq('is_completed', true);

      const completedSet = new Set(
        (userProgress as UserProgressRow[] | null)?.map((p) => p.material_id) || []
      );

      // Kalkulasi Progres per Kelas
      let totalCompletedCount = 0;
      const progressList: CourseProgress[] = ((courses as CourseRow[] | null) || []).map((course) => {
        const totalMats = course.materials?.length || 0;
        const completedMats = (course.materials || []).filter((material) =>
          completedSet.has(material.id)
        ).length;

        totalCompletedCount += completedMats;
        const percentage = totalMats > 0 ? Math.round((completedMats / totalMats) * 100) : 0;

        return {
          courseId: course.id,
          courseTitle: course.title,
          totalMaterials: totalMats,
          completedMaterials: completedMats,
          percentage,
        };
      });

      // 3. Ambil Riwayat Kuis
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('id, score, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(5);

      const typedAttempts = (attempts as QuizAttemptRow[] | null) || [];
      const totalScore = typedAttempts.reduce((acc, curr) => acc + curr.score, 0);
      const avgScore = typedAttempts.length > 0 ? Math.round(totalScore / typedAttempts.length) : 0;

      if (!isMounted) {
        return;
      }

      setCourseProgresses(progressList);
      setQuizHistory(
        typedAttempts.map((attempt) => ({
          id: attempt.id,
          score: attempt.score,
          completedAt: new Date(attempt.completed_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }))
      );

      setStats({
        totalCourses: (courses as CourseRow[] | null)?.length || 0,
        totalCompletedMaterials: totalCompletedCount,
        avgQuizScore: avgScore,
      });

      setLoading(false);
    };

    void fetchLearningData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat Learning Journey...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Mata Kuliah</p>
            <h4 className="text-2xl font-bold text-gray-800">{stats.totalCourses}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Materi Selesai</p>
            <h4 className="text-2xl font-bold text-gray-800">{stats.totalCompletedMaterials}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Rata-Rata Nilai Kuis</p>
            <h4 className="text-2xl font-bold text-gray-800">{stats.avgQuizScore} / 100</h4>
          </div>
        </div>
      </div>

      {/* Section Progress Per Mata Kuliah */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b pb-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">Progres per Mata Kuliah</h3>
        </div>

        <div className="space-y-4">
          {courseProgresses.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada mata kuliah yang terdaftar.</p>
          ) : (
            courseProgresses.map((cp) => (
              <div key={cp.courseId} className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-700">{cp.courseTitle}</span>
                  <span className="text-gray-500">
                    {cp.completedMaterials} / {cp.totalMaterials} Materi ({cp.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${cp.percentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section Riwayat Kuis Terbaru */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-3">Riwayat Kuis Terakhir</h3>
        {quizHistory.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada riwayat kuis yang dikerjakan.</p>
        ) : (
          <div className="divide-y">
            {quizHistory.map((q) => (
              <div key={q.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-gray-800">Evaluasi Kuis AI</p>
                  <p className="text-xs text-gray-400">{q.completedAt}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    q.score >= 70
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  Skor: {q.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}