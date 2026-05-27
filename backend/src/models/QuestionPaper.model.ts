import mongoose, { Schema, Document, Types } from 'mongoose';
import { QuestionSection, DifficultyLevel, QuestionType } from '../types';

/**
 * MongoDB document interface for QuestionPaper
 */
export interface IQuestionPaper extends Document {
  assessmentId: Types.ObjectId;
  jobId: string;
  sections: QuestionSection[];
  totalMarks: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sub-schema for individual questions
 */
const QuestionSubSchema = new Schema(
  {
    id: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      required: true,
      enum: Object.values(DifficultyLevel)
    },
    marks: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(QuestionType)
    }
  },
  { _id: false }
);

/**
 * Sub-schema for question sections
 */
const QuestionSectionSubSchema = new Schema(
  {
    label: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    instructions: {
      type: String,
      required: false
    },
    questions: {
      type: [QuestionSubSchema],
      required: true,
      default: []
    }
  },
  { _id: false }
);

/**
 * Mongoose schema for QuestionPaper
 */
const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true
    },
    jobId: {
      type: String,
      required: true,
      unique: true
    },
    sections: {
      type: [QuestionSectionSubSchema],
      required: true,
      default: []
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for performance
QuestionPaperSchema.index({ jobId: 1 });
QuestionPaperSchema.index({ assessmentId: 1 });
QuestionPaperSchema.index({ createdAt: -1 });

/**
 * QuestionPaper model
 */
export const QuestionPaper = mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema);
