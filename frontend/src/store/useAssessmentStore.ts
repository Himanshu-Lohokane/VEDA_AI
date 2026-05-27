import { create } from 'zustand';
import { AssessmentFormData, JobProgress, QuestionPaper, QuestionType } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AssessmentStore {
  formData: AssessmentFormData | null;
  progress: JobProgress | null;
  questionPaper: QuestionPaper | null;
  socket: any | null;

  setFormData: (data: AssessmentFormData) => void;
  submitAssessment: (data: AssessmentFormData & { file?: File }) => Promise<string>;
  connectSocket: (jobId: string) => void;
  disconnectSocket: () => void;
  updateProgress: (progress: JobProgress) => void;
  fetchQuestionPaper: (paperId: string) => Promise<void>;
  regenerate: (paperId: string) => Promise<string>;
  downloadPDF: (paperId: string) => Promise<void>;
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  formData: null,
  progress: null,
  questionPaper: null,
  socket: null,

  setFormData: (data) => set({ formData: data }),

  submitAssessment: async (data) => {
    // Step 1: Upload file if present
    let fileId: string | undefined;
    if (data.file) {
      const formData = new FormData();
      formData.append('file', data.file);
      const uploadRes = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.message || 'File upload failed');
      }
      const uploadData = await uploadRes.json();
      fileId = uploadData.fileId;
    }

    // Step 2: Create assessment
    const payload = {
      fileId,
      dueDate: data.dueDate,
      questionTypes: data.questionTypes,
      numberOfQuestions: data.numberOfQuestions,
      marksPerQuestion: data.marksPerQuestion,
      additionalInstructions: data.additionalInstructions
    };

    const res = await fetch(`${API_URL}/api/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create assessment');
    }

    const { jobId } = await res.json();
    set({ formData: { ...data, fileId } });
    return jobId;
  },

  connectSocket: (jobId) => {
    // Poll the job status endpoint every 2 seconds
    set({ progress: { jobId, status: 'queued', progress: 0, message: 'Queued for generation...' } });

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/jobs/${jobId}`);
        if (!res.ok) return;
        const data: JobProgress = await res.json();
        set({ progress: data });

        // Stop polling when done
        if (data.status === 'completed' || data.status === 'failed') return;

        // Continue polling
        const timer = setTimeout(poll, 2000);
        set({ socket: timer });
      } catch {
        // Retry on network error
        const timer = setTimeout(poll, 3000);
        set({ socket: timer });
      }
    };

    const timer = setTimeout(poll, 1000);
    set({ socket: timer });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) clearTimeout(socket);
    set({ socket: null });
  },

  updateProgress: (progress) => set({ progress }),

  fetchQuestionPaper: async (paperId) => {
    console.log('[STORE] Fetching paper:', paperId);
    const res = await fetch(`${API_URL}/api/papers/${paperId}`);
    if (!res.ok) {
      console.error('[STORE] Fetch failed:', res.status, res.statusText);
      throw new Error('Question paper not found');
    }
    const data = await res.json();
    console.log('[STORE] Received data:', {
      id: data.id,
      sectionsCount: data.sections?.length,
      totalMarks: data.totalMarks
    });

    const paper: QuestionPaper = {
      id: data.id,
      jobId: data.jobId,
      formData: {
        ...data.formData,
        questionTypes: (data.formData?.questionTypes || []) as QuestionType[]
      },
      sections: data.sections,
      totalMarks: data.totalMarks,
      createdAt: new Date(data.createdAt)
    };

    console.log('[STORE] Setting paper in store:', {
      sectionsCount: paper.sections.length,
      totalQuestions: paper.sections.reduce((a, s) => a + s.questions.length, 0)
    });
    set({ questionPaper: paper });
  },

  regenerate: async (paperId) => {
    const res = await fetch(`${API_URL}/api/papers/${paperId}/regenerate`, {
      method: 'POST'
    });
    if (!res.ok) {
      throw new Error('Failed to regenerate');
    }
    const { jobId } = await res.json();
    return jobId;
  },

  downloadPDF: async (paperId) => {
    const { questionPaper } = get();
    if (!questionPaper) return;

    // Generate a clean text-based PDF representation
    const lines: string[] = [];
    lines.push('VedaAI Assessment Question Paper');
    lines.push('='.repeat(50));
    lines.push(`Total Marks: ${questionPaper.totalMarks}`);
    lines.push(`Generated: ${new Date(questionPaper.createdAt).toLocaleDateString()}`);
    lines.push('');
    lines.push('Student Name: ___________________________');
    lines.push('Roll Number:  ___________________________');
    lines.push('Section:      ___________________________');
    lines.push('');

    questionPaper.sections.forEach((section) => {
      lines.push(`Section ${section.label}: ${section.title}`);
      lines.push('-'.repeat(40));
      if (section.instructions) lines.push(`Instructions: ${section.instructions}`);
      lines.push('');
      section.questions.forEach((q, i) => {
        lines.push(`${i + 1}. ${q.text}`);
        lines.push(`   [${q.difficulty}] [${q.marks} mark${q.marks !== 1 ? 's' : ''}]`);
        lines.push('');
      });
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question-paper-${paperId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}));
