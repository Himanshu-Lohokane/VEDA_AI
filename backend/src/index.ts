import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { connectDatabase, isConnected } from './config/database';
import { FileStorageService } from './services/fileStorage.service';
import { QuestionGeneratorService } from './services/questionGenerator.service';
import { Assessment } from './models/Assessment.model';
import { QuestionPaper } from './models/QuestionPaper.model';
import { QuestionType } from './types';

// Load .env from the project root (works for both `ts-node src/` and compiled `dist/`)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const jobProgress: Record<string, {
  jobId: string;
  status: 'queued' | 'started' | 'generating' | 'parsing' | 'completed' | 'failed';
  progress: number;
  message: string;
  paperId?: string;
  error?: string;
}> = {};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and TXT are allowed.'));
    }
  }
});

// CORS configuration for Vercel
const corsOptions = {
  origin: process.env.CORS_ORIGIN || process.env.VERCEL_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', database: isConnected() ? 'connected' : 'disconnected' });
});

app.get('/', (_req, res) => {
  res.json({ 
    message: 'VedaAI Assessment Creator API',
    status: 'running',
    endpoints: {
      health: '/health',
      upload: 'POST /api/upload',
      assessments: 'POST /api/assessments',
      job: 'GET /api/jobs/:jobId',
      paper: 'GET /api/papers/:paperId',
      regenerate: 'POST /api/papers/:paperId/regenerate'
    }
  });
});

// ─── FILE UPLOAD ─────────────────────────────────────────────────────────────
app.post(['/api/upload', '/upload'], upload.single('file'), async (req, res) => {
  console.log('[UPLOAD] Received file upload request');
  try {
    if (!req.file) {
      console.log('[UPLOAD] No file in request');
      return res.status(400).json({ error: 'No file provided' });
    }
    console.log(`[UPLOAD] File: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);
    const db = mongoose.connection.db!;
    const fileService = new FileStorageService(db);
    const fileId = await fileService.uploadFile(req.file);
    console.log(`[UPLOAD] Stored with fileId: ${fileId}`);
    return res.json({ fileId });
  } catch (error) {
    console.error('[UPLOAD] Error:', error);
    return res.status(500).json({ error: 'File upload failed', message: error instanceof Error ? error.message : String(error) });
  }
});

// ─── CREATE ASSESSMENT ────────────────────────────────────────────────────────
app.post(['/api/assessments', '/assessments'], async (req, res) => {
  console.log('[ASSESSMENT] Received create request');
  console.log('[ASSESSMENT] Body:', JSON.stringify(req.body, null, 2));
  try {
    const { fileId, dueDate, questionTypes, numberOfQuestions, marksPerQuestion, additionalInstructions } = req.body;

    if (!dueDate || !questionTypes || !numberOfQuestions || !marksPerQuestion) {
      console.log('[ASSESSMENT] Missing required fields');
      return res.status(400).json({ error: 'Missing required fields: dueDate, questionTypes, numberOfQuestions, marksPerQuestion' });
    }

    const jobId = uuidv4();
    console.log(`[ASSESSMENT] Creating job ${jobId}`);

    const assessment = new Assessment({
      jobId,
      formData: {
        fileId,
        dueDate: new Date(dueDate),
        questionTypes,
        numberOfQuestions: Number(numberOfQuestions),
        marksPerQuestion: Number(marksPerQuestion),
        additionalInstructions: additionalInstructions || ''
      },
      status: 'queued'
    });
    await assessment.save();
    console.log(`[ASSESSMENT] Saved to MongoDB, assessmentId: ${assessment._id}`);

    jobProgress[jobId] = { jobId, status: 'queued', progress: 0, message: 'Queued for generation...' };

    // Fire and forget — log errors inside
    runGeneration(jobId, assessment._id.toString(), {
      fileId,
      dueDate,
      questionTypes: questionTypes as QuestionType[],
      numberOfQuestions: Number(numberOfQuestions),
      marksPerQuestion: Number(marksPerQuestion),
      additionalInstructions: additionalInstructions || ''
    });

    console.log(`[ASSESSMENT] Returning jobId: ${jobId}`);
    return res.json({ jobId, status: 'queued' });
  } catch (error) {
    console.error('[ASSESSMENT] Error:', error);
    return res.status(500).json({ error: 'Failed to create assessment', message: error instanceof Error ? error.message : String(error) });
  }
});

// ─── JOB STATUS ───────────────────────────────────────────────────────────────
app.get(['/api/jobs/:jobId', '/jobs/:jobId'], (req, res) => {
  const { jobId } = req.params;
  const progress = jobProgress[jobId];
  if (!progress) {
    console.log(`[JOB] Not found: ${jobId}`);
    return res.status(404).json({ error: 'Job not found' });
  }
  console.log(`[JOB] ${jobId} → ${progress.status} (${progress.progress}%)`);
  return res.json(progress);
});

// ─── GET PAPER ────────────────────────────────────────────────────────────────
app.get(['/api/papers/:paperId', '/papers/:paperId'], async (req, res) => {
  const { paperId } = req.params;
  console.log(`[PAPER] Fetching paper: ${paperId}`);
  try {
    const paper = await QuestionPaper.findById(paperId).lean();
    if (!paper) {
      console.log(`[PAPER] Not found: ${paperId}`);
      return res.status(404).json({ error: 'Question paper not found' });
    }
    const assessment = await Assessment.findOne({ jobId: paper.jobId }).lean();
    console.log(`[PAPER] Found paper with ${paper.sections?.length} sections`);
    
    // Detailed logging of what we're sending
    paper.sections?.forEach((sec, i) => {
      console.log(`[PAPER] Section ${i + 1}: ${sec.label} - ${sec.title} (${sec.questions.length} questions)`);
      sec.questions.forEach((q, j) => {
        console.log(`[PAPER]   Q${j + 1}: "${q.text.substring(0, 50)}..." [${q.difficulty}, ${q.marks}m]`);
      });
    });
    
    const response = {
      id: paper._id.toString(),
      jobId: paper.jobId,
      sections: paper.sections,
      totalMarks: paper.totalMarks,
      createdAt: paper.createdAt,
      formData: assessment?.formData || {}
    };
    
    console.log(`[PAPER] Sending response: ${JSON.stringify(response).length} bytes`);
    return res.json(response);
  } catch (error) {
    console.error('[PAPER] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch question paper', message: error instanceof Error ? error.message : String(error) });
  }
});

// ─── REGENERATE ───────────────────────────────────────────────────────────────
app.post(['/api/papers/:paperId/regenerate', '/papers/:paperId/regenerate'], async (req, res) => {
  const { paperId } = req.params;
  console.log(`[REGEN] Regenerating paper: ${paperId}`);
  try {
    const paper = await QuestionPaper.findById(paperId).lean();
    if (!paper) return res.status(404).json({ error: 'Question paper not found' });

    const assessment = await Assessment.findOne({ jobId: paper.jobId }).lean();
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    const newJobId = uuidv4();
    const newAssessment = new Assessment({ jobId: newJobId, formData: assessment.formData, status: 'queued' });
    await newAssessment.save();

    jobProgress[newJobId] = { jobId: newJobId, status: 'queued', progress: 0, message: 'Queued for regeneration...' };

    runGeneration(newJobId, newAssessment._id.toString(), {
      fileId: assessment.formData.fileId,
      dueDate: assessment.formData.dueDate.toString(),
      questionTypes: assessment.formData.questionTypes as QuestionType[],
      numberOfQuestions: assessment.formData.numberOfQuestions,
      marksPerQuestion: assessment.formData.marksPerQuestion,
      additionalInstructions: assessment.formData.additionalInstructions
    });

    console.log(`[REGEN] New jobId: ${newJobId}`);
    return res.json({ jobId: newJobId, status: 'queued' });
  } catch (error) {
    console.error('[REGEN] Error:', error);
    return res.status(500).json({ error: 'Failed to regenerate', message: error instanceof Error ? error.message : String(error) });
  }
});

// ─── GENERATION WORKER ────────────────────────────────────────────────────────
async function runGeneration(
  jobId: string,
  assessmentId: string,
  formData: {
    fileId?: string;
    dueDate: string;
    questionTypes: QuestionType[];
    numberOfQuestions: number;
    marksPerQuestion: number;
    additionalInstructions: string;
  }
) {
  console.log(`[GEN:${jobId}] Starting generation`);
  console.log(`[GEN:${jobId}] Params: ${formData.numberOfQuestions} questions, types: ${formData.questionTypes.join(',')}`);

  try {
    jobProgress[jobId] = { jobId, status: 'started', progress: 10, message: 'Starting generation...' };
    await Assessment.findOneAndUpdate({ jobId }, { status: 'started' });

    // Extract file content
    let fileContent: string | undefined;
    if (formData.fileId) {
      console.log(`[GEN:${jobId}] Extracting file content from fileId: ${formData.fileId}`);
      try {
        const db = mongoose.connection.db!;
        const fileService = new FileStorageService(db);
        fileContent = await fileService.extractTextContent(formData.fileId);
        console.log(`[GEN:${jobId}] Extracted ${fileContent.length} chars from file`);
      } catch (e) {
        console.warn(`[GEN:${jobId}] File extraction failed (continuing without it):`, e instanceof Error ? e.message : e);
      }
    }

    jobProgress[jobId] = { jobId, status: 'generating', progress: 40, message: 'Generating questions with AI...' };
    await Assessment.findOneAndUpdate({ jobId }, { status: 'generating' });
    console.log(`[GEN:${jobId}] Calling OpenRouter API...`);

    const generator = new QuestionGeneratorService();
    const questionPaper = await generator.generateQuestions(formData, fileContent, jobId);
    console.log(`[GEN:${jobId}] AI returned ${questionPaper.sections.length} sections, ${questionPaper.sections.reduce((a, s) => a + s.questions.length, 0)} questions`);

    jobProgress[jobId] = { jobId, status: 'parsing', progress: 75, message: 'Structuring question paper...' };
    await Assessment.findOneAndUpdate({ jobId }, { status: 'parsing' });

    const savedPaper = new QuestionPaper({
      assessmentId,
      jobId,
      sections: questionPaper.sections,
      totalMarks: questionPaper.totalMarks
    });
    await savedPaper.save();
    const paperId = savedPaper._id.toString();
    console.log(`[GEN:${jobId}] Saved paper with id: ${paperId}`);

    jobProgress[jobId] = { jobId, status: 'completed', progress: 100, message: 'Question paper ready!', paperId };
    await Assessment.findOneAndUpdate({ jobId }, { status: 'completed' });
    console.log(`[GEN:${jobId}] ✓ COMPLETED → paperId: ${paperId}`);

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[GEN:${jobId}] ✗ FAILED:`, errMsg);
    jobProgress[jobId] = { jobId, status: 'failed', progress: 0, message: 'Generation failed', error: errMsg };
    await Assessment.findOneAndUpdate({ jobId }, { status: 'failed' });
  }
}

// ─── START ────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDatabase();
    
    // For Vercel serverless, don't call app.listen
    if (process.env.VERCEL) {
      console.log('✓ Running on Vercel serverless');
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
      console.log(`✓ OpenRouter key: ${process.env.OPENROUTER_API_KEY ? 'SET ✓' : 'MISSING ✗'}`);
    } else {
      app.listen(PORT, () => {
        console.log(`✓ Server is running on port ${PORT}`);
        console.log(`✓ Environment: ${process.env.NODE_ENV}`);
        console.log(`✓ CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
        console.log(`✓ OpenRouter key: ${process.env.OPENROUTER_API_KEY ? 'SET ✓' : 'MISSING ✗'}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

startServer();

// Export for Vercel serverless
export default app;
