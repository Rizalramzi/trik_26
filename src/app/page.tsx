'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import LearningJourneyDashboard from '@/components/LearningJourneyDashboard';
import { LogOut, BookOpen, BarChart3, Plus, ArrowRight, FolderOpen } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

function CoursesDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCourses(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCourses(data);
      }
      setLoading(false);
    };

    void loadCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase.from('courses').insert({
      title,
      description,
      user_id: userData.user.id,
    });

    if (!error) {
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
      fetchCourses();
    } else {
      alert('Gagal menambah mata kuliah: ' + error.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section Courses */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Mata Kuliah Saya</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Pilih atau buat kelas baru untuk mulai mengunggah materi
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Kuliah</span>
        </button>
      </div>

      {/* Grid List Mata Kuliah */}
      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500">Memuat mata kuliah...</div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center space-y-3">
          <FolderOpen className="w-10 h-10 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600 font-medium">Belum ada mata kuliah yang tersedia.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            + Tambah mata kuliah pertama Anda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/course/${course.id}`}
              className="group border rounded-xl bg-white p-5 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {course.description || 'Tidak ada deskripsi.'}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-blue-600 pt-4 border-t border-gray-50 mt-4">
                <span>Buka Kelas</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Tambah Mata Kuliah */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border">
            <h3 className="text-lg font-bold text-gray-900">Tambah Mata Kuliah Baru</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Mata Kuliah
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pemrograman Web"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Deskripsi Ringkas
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Semester 4 - Jadwal Senin 08.00"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium border rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MainPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'journey'>('courses');
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation Bar */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white font-bold p-2 rounded-lg text-lg leading-none">
              AI
            </div>
            <h1 className="text-xl font-bold text-gray-800">Learning Hub</h1>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 font-medium transition-colors border px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b pb-1">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'courses'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mata Kuliah Saya</span>
          </button>

          <button
            onClick={() => setActiveTab('journey')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'journey'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Learning Journey & Progress</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <section>
          {activeTab === 'courses' ? <CoursesDashboard /> : <LearningJourneyDashboard />}
        </section>
      </main>
    </div>
  );
}