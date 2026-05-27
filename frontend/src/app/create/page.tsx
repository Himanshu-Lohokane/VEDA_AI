'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { QuestionType } from '@/types';
import { Upload, ArrowLeft, Bell, Plus, Minus, X, Calendar } from 'lucide-react';

interface QuestionTypeConfig {
  type: QuestionType;
  count: number;
  marks: number;
}

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: QuestionType.MULTIPLE_CHOICE, label: 'Multiple Choice Questions' },
  { value: QuestionType.SHORT_ANSWER, label: 'Short Answer Questions' },
  { value: QuestionType.ESSAY, label: 'Essay Questions' },
  { value: QuestionType.TRUE_FALSE, label: 'True / False Questions' },
  { value: QuestionType.FILL_IN_BLANK, label: 'Fill in the Blank' },
];

const labelFor = (type: QuestionType) =>
  QUESTION_TYPE_OPTIONS.find(o => o.value === type)?.label ?? type;

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { submitAssessment } = useAssessmentStore();

  const [dueDate, setDueDate] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const [questionTypes, setQuestionTypes] = useState<QuestionTypeConfig[]>([
    { type: QuestionType.MULTIPLE_CHOICE, count: 4, marks: 1 },
    { type: QuestionType.SHORT_ANSWER, count: 3, marks: 3 },
    { type: QuestionType.ESSAY, count: 2, marks: 5 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const totalQuestions = questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  const updateCount = (i: number, v: number) =>
    setQuestionTypes(prev => prev.map((q, idx) => idx === i ? { ...q, count: Math.max(1, v) } : q));
  const updateMarks = (i: number, v: number) =>
    setQuestionTypes(prev => prev.map((q, idx) => idx === i ? { ...q, marks: Math.max(1, v) } : q));
  const updateType = (i: number, type: QuestionType) =>
    setQuestionTypes(prev => prev.map((q, idx) => idx === i ? { ...q, type } : q));
  const removeRow = (i: number) =>
    setQuestionTypes(prev => prev.filter((_, idx) => idx !== i));
  const addRow = () =>
    setQuestionTypes(prev => [...prev, { type: QuestionType.MULTIPLE_CHOICE, count: 1, marks: 1 }]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) { setFile(f); setUploadedFileName(f.name); }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setUploadedFileName(f.name); }
  };
  const removeFile = () => { setFile(null); setUploadedFileName(''); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!dueDate) e.dueDate = 'Due date is required';
    if (questionTypes.length === 0) e.questionTypes = 'Add at least one question type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const jobId = await submitAssessment({
        dueDate,
        questionTypes: questionTypes.map(q => q.type),
        numberOfQuestions: totalQuestions,
        marksPerQuestion: Math.round(totalMarks / totalQuestions),
        additionalInstructions,
        file: file ?? undefined,
      });
      router.push(`/progress/${jobId}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to submit' });
      setLoading(false);
    }
  };

  // ── Shared sub-components ────────────────────────────────────────────────

  const FileUploadArea = ({ inputId }: { inputId: string }) => (
    <div>
      {!uploadedFileName ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-gray-700 bg-gray-50' : 'border-gray-300'}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        >
          <input type="file" accept=".pdf,.txt,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" id={inputId} />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm mb-1">Choose a file or drag & drop it here</p>
          <p className="text-xs text-gray-400 mb-3">JPEG, PNG, PDF, TXT — up to 10 MB</p>
          <label htmlFor={inputId} className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 inline-block">
            Browse Files
          </label>
        </div>
      ) : (
        <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{uploadedFileName}</p>
              <p className="text-xs text-gray-500">Ready to upload</p>
            </div>
          </div>
          <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-1.5">Upload a reference document/image for better question generation</p>
    </div>
  );

  const QuestionTypeRows = () => (
    <div>
      <div className="hidden sm:flex items-center justify-between mb-2 px-1">
        <span className="text-sm font-medium text-gray-700 flex-1">Question Type</span>
        <div className="flex items-center space-x-8 text-xs text-gray-500 mr-8">
          <span>Questions</span>
          <span>Marks each</span>
        </div>
      </div>
      <div className="space-y-3">
        {questionTypes.map((qt, i) => (
          <div key={i} className="flex items-center space-x-2 sm:space-x-3">
            <select
              value={qt.type}
              onChange={(e) => updateType(i, e.target.value as QuestionType)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
            >
              {QUESTION_TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <button type="button" onClick={() => removeRow(i)} className="p-1.5 text-gray-400 hover:text-red-500 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>

            {/* Count stepper */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button type="button" onClick={() => updateCount(i, qt.count - 1)} className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50">
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-7 text-center text-sm font-medium">{qt.count}</span>
              <button type="button" onClick={() => updateCount(i, qt.count + 1)} className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50">
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Marks stepper */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button type="button" onClick={() => updateMarks(i, qt.marks - 1)} className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50">
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-7 text-center text-sm font-medium">{qt.marks}</span>
              <button type="button" onClick={() => updateMarks(i, qt.marks + 1)} className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {errors.questionTypes && <p className="text-red-500 text-xs mt-1">{errors.questionTypes}</p>}

      <button type="button" onClick={addRow} className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition mt-4 text-sm">
        <Plus className="w-4 h-4" />
        <span>Add Question Type</span>
      </button>

      <div className="flex justify-end space-x-6 mt-3 text-sm">
        <div><span className="text-gray-500">Total Questions:</span> <span className="font-semibold">{totalQuestions}</span></div>
        <div><span className="text-gray-500">Total Marks:</span> <span className="font-semibold">{totalMarks}</span></div>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────
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
            <button onClick={() => router.push('/create')} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-full flex items-center justify-center space-x-2 transition">
              <Plus className="w-4 h-4" /><span>Create Assignment</span>
            </button>
          </div>
          <nav className="px-6 space-y-1">
            <a href="/" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span>Home</span>
            </a>
            <a href="/" className="flex items-center justify-between px-3 py-2 text-gray-900 bg-gray-100 rounded-lg font-medium">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span>Assignments</span>
              </div>
              <span className="bg-orange-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">10</span>
            </a>
          </nav>
        </div>

        {/* Main */}
        <div className="flex-1">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <span className="text-gray-700 font-medium">Create Assignment</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative"><Bell className="w-6 h-6 text-gray-600" /><div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" /></div>
                <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-gray-300 rounded-full" /><span className="text-sm font-medium text-gray-900">John Doe</span></div>
              </div>
            </div>
          </header>

          <main className="p-8 max-w-3xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Assignment</h2>
              <p className="text-gray-500 text-sm">Set up a new AI-generated question paper</p>
            </div>

            {/* Progress indicator */}
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-gray-800 h-1.5 rounded-full" style={{ width: '33%' }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Step 1 of 3</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-0.5">Assignment Details</h3>
                  <p className="text-sm text-gray-500">Configure your question paper parameters</p>
                </div>

                <FileUploadArea inputId="file-input-desktop" />

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                    />
                    <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                </div>

                {/* Question Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Question Types</label>
                  <QuestionTypeRows />
                </div>

                {/* Additional Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Instructions <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    placeholder="e.g. Generate a question paper for a 3-hour exam, focus on chapters 1–5..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none text-sm"
                  />
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {errors.submit}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => router.back()} className="flex items-center space-x-2 px-6 py-2.5 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition text-sm">
                  <ArrowLeft className="w-4 h-4" /><span>Previous</span>
                </button>
                <button type="submit" disabled={loading} className="flex items-center space-x-2 px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 disabled:bg-gray-400 transition text-sm font-medium">
                  <span>{loading ? 'Generating...' : 'Generate Questions'}</span>
                  {!loading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="lg:hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => router.back()} className="p-1"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">V</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">VedaAI</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative"><Bell className="w-6 h-6 text-gray-600" /><div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" /></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full" />
            </div>
          </div>
        </header>

        <main className="p-4 pb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-0.5">Create Assignment</h2>
            <p className="text-sm text-gray-500">Configure your question paper</p>
          </div>

          <div className="mb-5">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-gray-800 h-1.5 rounded-full" style={{ width: '33%' }} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-5">
              <FileUploadArea inputId="file-input-mobile" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-sm"
                  />
                  <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Question Types</label>
                <div className="space-y-3">
                  {questionTypes.map((qt, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <select
                          value={qt.type}
                          onChange={(e) => updateType(i, e.target.value as QuestionType)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                        >
                          {QUESTION_TYPE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => removeRow(i)} className="p-1 text-gray-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Questions</label>
                          <div className="flex items-center space-x-2">
                            <button type="button" onClick={() => updateCount(i, qt.count - 1)} className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                            <span className="w-8 text-center text-sm font-medium">{qt.count}</span>
                            <button type="button" onClick={() => updateCount(i, qt.count + 1)} className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Marks each</label>
                          <div className="flex items-center space-x-2">
                            <button type="button" onClick={() => updateMarks(i, qt.marks - 1)} className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                            <span className="w-8 text-center text-sm font-medium">{qt.marks}</span>
                            <button type="button" onClick={() => updateMarks(i, qt.marks + 1)} className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addRow} className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition mt-3 w-full justify-center text-sm">
                  <Plus className="w-4 h-4" /><span>Add Question Type</span>
                </button>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-500">Total: <span className="font-semibold text-gray-800">{totalQuestions} questions</span></span>
                  <span className="text-gray-500"><span className="font-semibold text-gray-800">{totalMarks}</span> marks</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Instructions</label>
                <textarea
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. Focus on chapters 1–5, 3-hour exam..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 resize-none text-sm"
                />
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errors.submit}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => router.back()} className="flex items-center space-x-2 px-5 py-2.5 border border-gray-300 rounded-full text-gray-700 text-sm">
                <ArrowLeft className="w-4 h-4" /><span>Back</span>
              </button>
              <button type="submit" disabled={loading} className="flex items-center space-x-2 px-5 py-2.5 bg-gray-900 text-white rounded-full disabled:bg-gray-400 text-sm font-medium">
                <span>{loading ? 'Generating...' : 'Generate'}</span>
                {!loading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
