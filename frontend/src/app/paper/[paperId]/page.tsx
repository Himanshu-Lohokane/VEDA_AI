'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { Download, RefreshCw, Loader2, Bell, Plus } from 'lucide-react';

export default function QuestionPaperPage() {
  const router = useRouter();
  const params = useParams();
  const paperId = params.paperId as string;

  const { questionPaper, fetchQuestionPaper, regenerate, downloadPDF } = useAssessmentStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Student info state
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [section, setSection] = useState('');

  useEffect(() => {
    if (!paperId) return;
    console.log('[PAPER PAGE] Fetching paper:', paperId);
    fetchQuestionPaper(paperId)
      .then(() => {
        console.log('[PAPER PAGE] Paper fetched successfully');
      })
      .catch((e) => {
        console.error('[PAPER PAGE] Fetch error:', e);
        setError(e.message || 'Failed to load question paper');
      })
      .finally(() => setLoading(false));
  }, [paperId, fetchQuestionPaper]);

  const handleRegenerate = async () => {
    if (!questionPaper) return;
    setRegenerating(true);
    try {
      const jobId = await regenerate(paperId);
      router.push(`/progress/${jobId}`);
    } catch {
      setRegenerating(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadPDF(paperId);
    } finally {
      setDownloading(false);
    }
  };

  const difficultyStyle = (d: string) => {
    const lower = d?.toLowerCase() ?? '';
    if (lower === 'easy') return 'bg-green-100 text-green-700 border border-green-300';
    if (lower === 'moderate') return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    return 'bg-red-100 text-red-700 border border-red-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gray-700 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading question paper...</p>
        </div>
      </div>
    );
  }

  if (error || !questionPaper) {
    console.log('[PAPER PAGE] Error state:', error, 'Paper:', questionPaper);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200 max-w-sm w-full mx-4">
          <p className="text-gray-700 mb-4">{error || 'Question paper not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  console.log('[PAPER PAGE] Rendering paper with', questionPaper.sections.length, 'sections');
  questionPaper.sections.forEach((sec, i) => {
    console.log(`[PAPER PAGE] Section ${i + 1}:`, sec.label, sec.title, `(${sec.questions.length} questions)`);
  });

  let questionIndex = 0;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Desktop Layout ── */}
      <div className="hidden lg:flex">

        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex-shrink-0">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">VedaAI</span>
            </div>
          </div>

          <div className="px-6 mb-6">
            <button
              onClick={() => router.push('/create')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-full flex items-center justify-center space-x-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
          </div>

          <nav className="px-6 space-y-2">
            <a href="/" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>My Groups</span>
            </a>
            <a href="/" className="flex items-center justify-between px-3 py-2 text-gray-900 bg-gray-100 rounded-lg font-medium">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Assignments</span>
              </div>
              <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full">10</span>
            </a>
          </nav>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Question Paper</h1>
                <p className="text-sm text-gray-500">
                  {questionPaper.sections.reduce((a, s) => a + s.questions.length, 0)} questions · {questionPaper.totalMarks} marks total
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full" />
                  <span className="text-sm font-medium text-gray-900">John Doe</span>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-8 overflow-y-auto">

            {/* Action bar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Assessment Question Paper</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="flex items-center space-x-2 px-5 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition text-sm font-medium"
                >
                  <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                  <span>{regenerating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center space-x-2 px-5 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 disabled:opacity-50 transition text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
                </button>
              </div>
            </div>

            {/* Student Info Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Student Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="Enter roll number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="Enter section"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Question Sections */}
            {questionPaper.sections.map((sec) => {
              const startIdx = questionIndex;
              questionIndex += sec.questions.length;
              return (
                <div key={sec.label} className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Section {sec.label}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{sec.title}</h3>
                    {sec.instructions && (
                      <p className="text-sm text-gray-500 mt-1 italic">{sec.instructions}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {sec.questions.map((q, i) => (
                      <div key={q.id} className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
                        <span className="text-sm font-semibold text-gray-500 w-6 flex-shrink-0 mt-0.5">
                          {startIdx + i + 1}.
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 leading-relaxed">{q.text}</p>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyStyle(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                            {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 mt-6">
              Generated on {new Date(questionPaper.createdAt).toLocaleDateString()} · Paper ID: {paperId}
            </div>
          </main>
        </div>
      </div>

      {/* ── Mobile Layout ── */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">VedaAI</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full" />
            </div>
          </div>
        </header>

        <main className="p-4 pb-24">
          {/* Title + actions */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Question Paper</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex-1 flex items-center justify-center space-x-2 py-2 border border-gray-300 rounded-full text-gray-700 text-sm font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                <span>{regenerating ? 'Regenerating...' : 'Regenerate'}</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 flex items-center justify-center space-x-2 py-2 bg-gray-900 text-white rounded-full text-sm font-medium disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Downloading...' : 'Download'}</span>
              </button>
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Student Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="Roll number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="Section"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          {(() => {
            let mobileIdx = 0;
            return questionPaper.sections.map((sec) => {
              const startIdx = mobileIdx;
              mobileIdx += sec.questions.length;
              return (
                <div key={sec.label} className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Section {sec.label}</span>
                    <h3 className="text-base font-bold text-gray-900 mt-0.5">{sec.title}</h3>
                    {sec.instructions && (
                      <p className="text-xs text-gray-500 mt-1 italic">{sec.instructions}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    {sec.questions.map((q, i) => (
                      <div key={q.id} className="py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-start space-x-2 mb-1.5">
                          <span className="text-sm font-semibold text-gray-500 flex-shrink-0">{startIdx + i + 1}.</span>
                          <p className="text-sm text-gray-900 leading-relaxed">{q.text}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyStyle(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                            {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            });
          })()}

          <div className="text-center text-xs text-gray-400 mt-4">
            {questionPaper.totalMarks} marks total · Generated {new Date(questionPaper.createdAt).toLocaleDateString()}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white">
          <div className="flex items-center justify-around py-2">
            <a href="/" className="flex flex-col items-center py-2 px-3 text-gray-400">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs">Home</span>
            </a>
            <a href="#" className="flex flex-col items-center py-2 px-3 text-gray-400">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs">Groups</span>
            </a>
            <a href="/" className="flex flex-col items-center py-2 px-3 text-white">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs">Assignments</span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}
