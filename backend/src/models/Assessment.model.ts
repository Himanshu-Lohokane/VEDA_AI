import mongoose, { Schema, Document } from 'mongoose';
import { AssessmentFormData, QuestionType } from '../types';

/**
 * MongoDB document interface for Assessment
 */
export interface IAssessment extends Document {
  jobId: string;
  formData: {
    fileId?: string;
    dueDate: Date;
    questionTypes: QuestionType[];
    numberOfQuestions: number;
    marksPerQuestion: number;
    additionalInstructions: string;
  };
  status: 'queued' | 'started' | 'generating' | 'parsing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Assessment
 */
const AssessmentSchema = new Schema<IAssessment>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true
    },
    formData: {
      fileId: {
        type: String,
        required: false
      },
      dueDate: {
        type: Date,
        required: true
      },
      questionTypes: {
        type: [String],
        required: true,
        enum: Object.values(QuestionType)
      },
      numberOfQuestions: {
        type: Number,
        required: true,
        min: 1
      },
      marksPerQuestion: {
        type: Number,
        required: true,
        min: 1
      },
      additionalInstructions: {
        type: String,
        required: false,
        default: ''
      }
    },
    status: {
      type: String,
      required: true,
      enum: ['queued', 'started', 'generating', 'parsing', 'completed', 'failed'],
      default: 'queued'
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for performance
AssessmentSchema.index({ jobId: 1 });
AssessmentSchema.index({ status: 1 });
AssessmentSchema.index({ createdAt: -1 });

/**
 * Assessment model
 */
export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
