// Shared TypeScript types and interfaces for VedaAI Assessment Creator

/**
 * Enum for different types of questions that can be generated
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  TRUE_FALSE = 'true_false',
  FILL_IN_BLANK = 'fill_in_blank'
}

/**
 * Enum for difficulty levels of questions
 */
export enum DifficultyLevel {
  EASY = 'Easy',
  MODERATE = 'Moderate',
  HARD = 'Hard'
}

/**
 * Form data structure for creating an assessment
 */
export interface AssessmentFormData {
  file?: File;
  fileId?: string;
  dueDate: string;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  marksPerQuestion: number;
  additionalInstructions: string;
}

/**
 * Individual question structure
 */
export interface Question {
  id: string;
  text: string;
  difficulty: DifficultyLevel;
  marks: number;
  type: QuestionType;
}

/**
 * Section of questions (e.g., Section A, B, C)
 */
export interface QuestionSection {
  label: string;              // A, B, C, etc.
  title: string;
  instructions?: string;
  questions: Question[];
}

/**
 * Complete question paper structure
 */
export interface QuestionPaper {
  id: string;
  jobId: string;
  formData: AssessmentFormData;
  sections: QuestionSection[];
  totalMarks: number;
  createdAt: Date;
}

/**
 * Job progress tracking for real-time updates
 */
export interface JobProgress {
  jobId: string;
  status: 'queued' | 'started' | 'generating' | 'parsing' | 'completed' | 'failed';
  progress: number;           // 0-100
  message: string;
  paperId?: string;           // Available when completed
  error?: string;             // Available when failed
}

/**
 * Student information for the question paper
 */
export interface StudentInfo {
  name: string;
  rollNumber: string;
  section: string;
}

/**
 * API request type for creating an assessment
 */
export interface CreateAssessmentRequest {
  fileId?: string;
  dueDate: string;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  marksPerQuestion: number;
  additionalInstructions: string;
}

/**
 * API response type for creating an assessment
 */
export interface CreateAssessmentResponse {
  jobId: string;
  status: string;
}

/**
 * API response type for file upload
 */
export interface FileUploadResponse {
  fileId: string;
}

/**
 * API response type for getting a question paper
 */
export interface GetQuestionPaperResponse {
  id: string;
  jobId: string;
  sections: QuestionSection[];
  totalMarks: number;
  createdAt: string;
  formData: AssessmentFormData;
}

/**
 * API response type for getting job status
 */
export interface GetJobStatusResponse {
  jobId: string;
  status: 'queued' | 'started' | 'generating' | 'parsing' | 'completed' | 'failed';
  progress: number;
  message: string;
  paperId?: string;
  error?: string;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: any;
}
