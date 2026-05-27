'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { Bell, Plus } from 'lucide-react';

export default function ProgressPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const { progress, connectSocket, disconnectSocket } = useAssessmentStore();

  useEffect(() => {
    if (jobId) connectSocket(jobId);
    return () => disconnectSocket();
  }, [jobId, connectSocket, disconnectSocket]);

  useEffect(() => {
    if (progress?.status === 'completed' && progress.paperId) {
      setTimeout(() => router.push(`/paper/${progress.paperId}`), 800);
    }
  }, [progress, router]);

  const pct = progress?.progress ?? 0;
  const failed = progress?.status === 'failed';
  const completed = progress?.status === 'completed';

  const statusLabel = () => {
    switch (progress?.status) {
      case 'queued':     return 'Queued for generation...';
      case 'started':    return 'Starting up...';
      case 'generating': return 'Generating questions with AI...';
      case 'parsing':    return 'Structuring question paper...';
      case 'completed':  return 'Done! Redirecting...';
      case 'failed':     return 'Generation failed';
      default:           return 'Initializing...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Desktop ── */}
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
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Generating Assignment</h1>
                <p className="text-sm text-gray-500">Please wait while AI creates your question paper</p>
              </div>
              <div className="flex items-center space-x-4">
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

          <main className="flex-1 flex items-center justify-center p-8">
            <div className="bg-white rounded-xl border border-gray-200 p-10 w-full max-w-lg text-center">
              {/* Animated loader */}
              {!failed && !completed && (
                <div className="flex justify-center mb-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-gray-900 border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-900">{pct}%</span>
                    </div>
                  </div>
                </div>
              )}

              {completed && (
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {failed && (
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {completed ? 'Question Paper Ready!' : failed ? 'Generation Failed' : 'Generating Questions...'}
              </h2>
              <p className="text-gray-500 text-sm mb-6">{statusLabel()}</p>

              {/* Progress bar */}
              {!failed && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-gray-900 h-2 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}

              {failed && progress?.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-left">
                  <p className="text-sm text-red-700">{progress.error}</p>
                </div>
              )}

              {failed && (
                <button
                  onClick={() => router.push('/create')}
                  className="mt-2 px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
                >
                  Try Again
                </button>
              )}

              <p className="text-xs text-gray-400 mt-4">Job ID: {jobId}</p>
            </div>
          </main>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="lg:hidden">
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

        <main className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-8 w-full text-center">
            {!failed && !completed && (
              <div className="flex justify-center mb-5">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                  <div className="absolute inset-0 rounded-full border-4 border-gray-900 border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">{pct}%</span>
                  </div>
                </div>
              </div>
            )}

            {completed && (
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}

            {failed && (
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            )}

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {completed ? 'Ready!' : failed ? 'Failed' : 'Generating...'}
            </h2>
            <p className="text-gray-500 text-sm mb-5">{statusLabel()}</p>

            {!failed && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1 overflow-hidden">
                <div
                  className="bg-gray-900 h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}

            {failed && progress?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-left">
                <p className="text-xs text-red-700">{progress.error}</p>
              </div>
            )}

            {failed && (
              <button
                onClick={() => router.push('/create')}
                className="mt-2 px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-medium"
              >
                Try Again
              </button>
            )}

            <p className="text-xs text-gray-400 mt-4">Job ID: {jobId}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
