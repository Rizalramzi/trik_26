'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LearningJourneyDashboard from '@/components/LearningJourneyDashboard';
import { LogOut, BookOpen, BarChart3 } from 'lucide-react';

function CoursesDashboard() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-800">Mata Kuliah Saya</h2>
      <p className="mt-2 text-sm text-gray-500">
        Belum ada mata kuliah yang tersedia.
      </p>
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
            <div className="bg-blue-600 text-white font-bold p-2 rounded-lg text-lg">
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
          {activeTab === 'courses' ? (
            <CoursesDashboard />
          ) : (
            <LearningJourneyDashboard />
          )}
        </section>
      </main>
    </div>
  );
}