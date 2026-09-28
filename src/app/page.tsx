'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [material, setMaterial] = useState<{ title: string; content: string } | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', 'dummy-course-id'); // Ganti dengan ID kelas dinamis nanti

    const res = await fetch('/api/process-material', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMaterial(data);
    } else {
      alert('Gagal memproses berkas: ' + data.error);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">AI Learning Hub</h1>
      
      {/* Section Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center space-y-4">
        <input 
          type="file" 
          accept=".pdf,.docx,.txt" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:bg-gray-400"
        >
          {loading ? 'Memproses Berkas via AI...' : 'Upload & Generate Materi'}
        </button>
      </div>

      {/* Section Tampilan Hasil Rangkuman */}
      {material && (
        <article className="prose lg:prose-xl border p-6 rounded-lg bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4">{material.title}</h2>
          <ReactMarkdown>{material.content}</ReactMarkdown>
        </article>
      )}
    </main>
  );
}