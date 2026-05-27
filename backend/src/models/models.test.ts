/**
 * Test suite for Mongoose models
 * Tests Assessment and QuestionPaper models
 * 
 * Run with: npm test (after setting up test runner)
 * Or manually: npx ts-node src/models/models.test.ts
 */

import mongoose from 'mongoose';
import { Assessment, IAssessment } from './Assessment.model';
import { QuestionPaper, IQuestionPaper } from './QuestionPaper.model';
import { QuestionType, DifficultyLevel } from '../types';

/**
 * Test Assessment Model
 */
const testAssessmentModel = async () => {
  console.log('\n=== Testing Assessment Model ===\n');

  try {
    // Test 1: Create a valid assessment document
    console.log('Test 1: Creating a valid assessment document...');
    const assessmentData = {
      jobId: `job-${Date.now()}`,
      formData: {
        fileId: 'file-123',
        dueDate: new Date('2024-12-31'),
        questionTypes: [QuestionType.MULTIPLE_CHOICE, QuestionType.SHORT_ANSWER],
        numberOfQuestions: 10,
        marksPerQuestion: 5,
        additionalInstructions: 'Focus on chapters 1-3'
      },
      status: 'queued' as const
    };

    const assessment = await Assessment.create(assessmentData);
    console.log(`✓ Assessment created with ID: ${assessment._id}`);
    console.log(`  - jobId: ${assessment.jobId}`);
    console.log(`  - status: ${assessment.status}`);
    console.log(`  - numberOfQuestions: ${assessment.formData.numberOfQuestions}`);
    console.log(`  - marksPerQuestion: ${assessment.formData.marksPerQuestion}`);

    // Test 2: Verify timestamps are set
    console.log('\nTest 2: Verifying timestamps...');
    if (!assessment.createdAt || !assessment.updatedAt) {
      throw new Error('Timestamps not set on assessment');
    }
    console.log(`✓ createdAt: ${assessment.createdAt}`);
    console.log(`✓ updatedAt: ${assessment.updatedAt}`);

    // Test 3: Verify unique jobId constraint
    console.log('\nTest 3: Verifying unique jobId constraint...');
    try {
      await Assessment.create({
        jobId: assessment.jobId, // Same jobId
        formData: {
          dueDate: new Date(),
          questionTypes: [QuestionType.ESSAY],
          numberOfQuestions: 5,
          marksPerQuestion: 10,
          additionalInstructions: ''
        },
        status: 'queued'
      });
      throw new Error('Should have thrown duplicate key error');
    } catch (error: any) {
      if (error.code === 11000) {
        console.log('✓ Duplicate jobId correctly rejected');
      } else {
        throw error;
      }
    }

    // Test 4: Verify validation - numberOfQuestions must be >= 1
    console.log('\nTest 4: Verifying numberOfQuestions validation...');
    try {
      await Assessment.create({
        jobId: `job-invalid-${Date.now()}`,
        formData: {
          dueDate: new Date(),
          questionTypes: [QuestionType.ESSAY],
          numberOfQuestions: 0, // Invalid: must be >= 1
          marksPerQuestion: 10,
          additionalInstructions: ''
        },
        status: 'queued'
      });
      throw new Error('Should have thrown validation error');
    } catch (error: any) {
      if (error.errors?.['formData.numberOfQuestions']) {
        console.log('✓ numberOfQuestions validation working');
      } else {
        throw error;
      }
    }

    // Test 5: Verify validation - marksPerQuestion must be >= 1
    console.log('\nTest 5: Verifying marksPerQuestion validation...');
    try {
      await Assessment.create({
        jobId: `job-invalid-${Date.now()}`,
        formData: {
          dueDate: new Date(),
          questionTypes: [QuestionType.ESSAY],
          numberOfQuestions: 5,
          marksPerQuestion: 0, // Invalid: must be >= 1
          additionalInstructions: ''
        },
        status: 'queued'
      });
      throw new Error('Should have thrown validation error');
    } catch (error: any) {
      if (error.errors?.['formData.marksPerQuestion']) {
        console.log('✓ marksPerQuestion validation working');
      } else {
        throw error;
      }
    }

    // Test 6: Verify enum validation for questionTypes
    console.log('\nTest 6: Verifying questionTypes enum validation...');
    try {
      await Assessment.create({
        jobId: `job-invalid-${Date.now()}`,
        formData: {
          dueDate: new Date(),
          questionTypes: ['invalid_type' as any],
          numberOfQuestions: 5,
          marksPerQuestion: 10,
          additionalInstructions: ''
        },
        status: 'queued'
      });
      throw new Error('Should have thrown validation error');
    } catch (error: any) {
      if (error.errors?.['formData.questionTypes']) {
        console.log('✓ questionTypes enum validation working');
      } else {
        throw error;
      }
    }

    // Test 7: Verify enum validation for status
    console.log('\nTest 7: Verifying status enum validation...');
    try {
      await Assessment.create({
        jobId: `job-invalid-${Date.now()}`,
        formData: {
          dueDate: new Date(),
          questionTypes: [QuestionType.ESSAY],
          numberOfQuestions: 5,
          marksPerQuestion: 10,
          additionalInstructions: ''
        },
        status: 'invalid_status' as any
      });
      throw new Error('Should have thrown validation error');
    } catch (error: any) {
      if (error.errors?.status) {
        console.log('✓ status enum validation working');
      } else {
        throw error;
      }
    }

    // Test 8: Verify indexes exist
    console.log('\nTest 8: Verifying indexes...');
    const indexes = await Assessment.collection.getIndexes();
    const indexNames = Object.keys(indexes);
    console.log(`✓ Indexes found: ${indexNames.join(', ')}`);
    
    if (!indexNames.includes('jobId_1')) {
      console.warn('⚠ jobId index not found');
    } else {
      console.log('✓ jobId index exists');
    }

    // Test 9: Query by jobId using index
    console.log('\nTest 9: Querying by jobId...');
    const foundAssessment = await Assessment.findOne({ jobId: assessment.jobId });
    if (!foundAssessment) {
      throw new Error('Assessment not found by jobId');
    }
    console.log(`✓ Assessment found by jobId: ${foundAssessment._id}`);

    // Test 10: Update assessment status
    console.log('\nTest 10: Updating assessment status...');
    const updated = await Assessment.findByIdAndUpdate(
      assessment._id,
      { status: 'completed' },
      { new: true }
    );
    if (updated?.status !== 'completed') {
      throw new Error('Status not updated');
    }
    console.log(`✓ Status updated to: ${updated.status}`);

    // Cleanup
    await Assessment.deleteOne({ _id: assessment._id });
    console.log('\n✓ Assessment Model Tests Passed!\n');

  } catch (error) {
    console.error('\n✗ Assessment Model Test Failed:', error);
    throw error;
  }
};

/**
 * Test QuestionPaper Model
 */
const testQuestionPaperModel = async () => {
  console.log('\n=== Testing QuestionPaper Model ===\n');

  try {
    // First create an assessment to reference
    const assessment = await Assessment.create({
      jobId: `job-qp-${Date.now()}`,
      formData: {
        dueDate: new Date(),
        questionTypes: [QuestionType.MULTIPLE_CHOICE],
        numberOfQuestions: 5,
        marksPerQuestion: 5,
        additionalInstructions: ''
      },
      status: 'queued'
    });

    // Test 1: Create a valid question paper document
    console.log('Test 1: Creating a valid question paper document...');
    const questionPaperData = {
      assessmentId: assessment._id,
      jobId: `job-qp-${Date.now()}`,
      sections: [
        {
          label: 'A',
          title: 'Section A: Basic Concepts',
          instructions: 'Answer all questions',
          questions: [
            {
              id: 'q1',
              text: 'What is the capital of France?',
              difficulty: DifficultyLevel.EASY,
              marks: 5,
              type: QuestionType.MULTIPLE_CHOICE
            },
            {
              id: 'q2',
              text: 'Explain the theory of relativity',
              difficulty: DifficultyLevel.HARD,
              marks: 10,
              type: QuestionType.ESSAY
            }
          ]
        },
        {
          label: 'B',
          title: 'Section B: Advanced Topics',
          questions: [
            {
              id: 'q3',
              text: 'Define photosynthesis',
              difficulty: DifficultyLevel.MODERATE,
              marks: 5,
              type: QuestionType.SHORT_ANSWER
            }
          ]
        }
      ],
      totalMarks: 20
    };

    const questionPaper = await QuestionPaper.create(questionPaperData);
    console.log(`✓ QuestionPaper created with ID: ${questionPaper._id}`);
    console.log(`  - jobId: ${questionPaper.jobId}`);
    console.log(`  - sections: ${questionPaper.sections.length}`);
    console.log(`  - totalMarks: ${questionPaper.totalMarks}`);

    // Test 2: Verify timestamps are set
    console.log('\nTest 2: Verifying timestamps...');
    if (!questionPaper.createdAt || !questionPaper.updatedAt) {
      throw new Error('Timestamps not set on question paper');
    }
    console.log(`✓ createdAt: ${questionPaper.createdAt}`);
    console.log(`✓ updatedAt: ${questionPaper.updatedAt}`);

    // Test 3: Verify unique jobId constraint
    console.log('\nTest 3: Verifying unique jobId constraint...');
    try {
      await QuestionPaper.create({
        assessmentId: assessment._id,
        jobId: questionPaper.jobId, // Same jobId
        sections: [],
        totalMarks: 0
      });
      throw new Error('Should have thrown duplicate key error');
    } catch (error: any) {
      if (error.code === 11000) {
        console.log('✓ Duplicate jobId correctly rejected');
      } else {
        throw error;
      }
    }

    // Test 4: Verify nested question structure
    console.log('\nTest 4: Verifying nested question structure...');
    const retrieved = await QuestionPaper.findById(questionPaper._id);
    if (!retrieved) {
      throw new Error('QuestionPaper not found');
    }
    console.log(`✓ Retrieved ${retrieved.sections.length} sections`);
    console.log(`✓ Section A has ${retrieved.sections[0].questions.length} questions`);
    console.log(`✓ First question: "${retrieved.sections[0].questions[0].text}"`);
    console.log(`✓ First question difficulty: ${retrieved.sections[0].questions[0].difficulty}`);

    // Test 5: Verify enum validation for difficulty
    console.log('\nTest 5: Verifying difficulty enum validation...');
    try {
      await QuestionPaper.create({
        assessmentId: assessment._id,
        jobId: `job-invalid-${Date.now()}`,
        sections: [
          {
            label: 'A',
            title: 'Test',
            questions: [
              {
                id: 'q1',
                text: 'Test question',
                difficulty: 'invalid_difficulty' as any,
                marks: 5,
                type: QuestionType.ESSAY
              }
            ]
          }
        ],
        totalMarks: 5
      });
      throw new Error('Should have thrown validation error');
    } catch (error: any) {
      if (error.errors) {
        console.log('✓ Difficulty enum validation working');
      } else {
        throw error;
      }
    }

    // Test 6: Verify enum validation for question type
    console.log('\nTest 6: Verifying question type enum validation...');
    try {
      await QuestionPaper.create({
        assessmentId: assessment._id,
        jobId: `job-invalid-${Date.now()}`,
        sections: [
          {
            label: 'A',
            title: 'Test',
            questions: [
              {
                id: 'q1',
                text: 'Test question',
                difficulty: DifficultyLevel.EASY,
                marks: 5,
                type: 'invalid_type' as any
              }
            ]
          }
        ],
        totalMarks: 5
      });
      throw new Error('Should have thrown validation error');
    } catch (error: any) {
      if (error.errors) {
        console.log('✓ Question type enum validation working');
      } else {
        throw error;
      }
    }

    // Test 7: Verify marks validation
    console.log('\nTest 7: Verifying marks validation...');
    try {
      await QuestionPaper.create({
        assessmentId: assessment._id,
        jobId: `job-invalid-${Date.now()}`,
        sections: [
          {
            label: 'A',
            title: 'Test',
            questions: [
              {
                id: 'q1',
                text: 'Test question',
                difficulty: DifficultyLevel.EASY,
                marks: -5, // Invalid: must be >= 0
                type: QuestionType.ESSAY
              }
            ]
          }
        ],
        totalMarks: 5
      });
      throw new Error('Should have thrown validation error');
    } catch (error: any) {
      if (error.errors) {
        console.log('✓ Marks validation working');
      } else {
        throw error;
      }
    }

    // Test 8: Verify totalMarks validation
    console.log('\nTest 8: Verifying totalMarks validation...');
    try {
      await QuestionPaper.create({
        assessmentId: assessment._id,
        jobId: `job-invalid-${Date.now()}`,
        sections: [
          {
            label: 'A',
            title: 'Test',
            questions: [
              {
                id: 'q1',
                text: 'Test question',
                difficulty: DifficultyLevel.EASY,
                marks: 5,
                type: QuestionType.ESSAY
              }
            ]
          }
        ],
        totalMarks: -10 // Invalid: must be >= 0
      });
      throw new Error('Should have thrown validation error');
    } catch (error: any) {
      if (error.errors?.totalMarks) {
        console.log('✓ totalMarks validation working');
      } else {
        throw error;
      }
    }

    // Test 9: Verify indexes exist
    console.log('\nTest 9: Verifying indexes...');
    const indexes = await QuestionPaper.collection.getIndexes();
    const indexNames = Object.keys(indexes);
    console.log(`✓ Indexes found: ${indexNames.join(', ')}`);
    
    if (!indexNames.includes('jobId_1')) {
      console.warn('⚠ jobId index not found');
    } else {
      console.log('✓ jobId index exists');
    }

    if (!indexNames.includes('assessmentId_1')) {
      console.warn('⚠ assessmentId index not found');
    } else {
      console.log('✓ assessmentId index exists');
    }

    // Test 10: Query by jobId using index
    console.log('\nTest 10: Querying by jobId...');
    const foundPaper = await QuestionPaper.findOne({ jobId: questionPaper.jobId });
    if (!foundPaper) {
      throw new Error('QuestionPaper not found by jobId');
    }
    console.log(`✓ QuestionPaper found by jobId: ${foundPaper._id}`);

    // Test 11: Query by assessmentId using index
    console.log('\nTest 11: Querying by assessmentId...');
    const foundByAssessment = await QuestionPaper.findOne({ assessmentId: assessment._id });
    if (!foundByAssessment) {
      throw new Error('QuestionPaper not found by assessmentId');
    }
    console.log(`✓ QuestionPaper found by assessmentId: ${foundByAssessment._id}`);

    // Test 12: Verify optional instructions field
    console.log('\nTest 12: Verifying optional instructions field...');
    const paperWithoutInstructions = await QuestionPaper.create({
      assessmentId: assessment._id,
      jobId: `job-no-inst-${Date.now()}`,
      sections: [
        {
          label: 'A',
          title: 'Test',
          // No instructions field
          questions: [
            {
              id: 'q1',
              text: 'Test question',
              difficulty: DifficultyLevel.EASY,
              marks: 5,
              type: QuestionType.ESSAY
            }
          ]
        }
      ],
      totalMarks: 5
    });
    console.log(`✓ QuestionPaper created without instructions: ${paperWithoutInstructions._id}`);

    // Cleanup
    await QuestionPaper.deleteMany({ assessmentId: assessment._id });
    await Assessment.deleteOne({ _id: assessment._id });
    console.log('\n✓ QuestionPaper Model Tests Passed!\n');

  } catch (error) {
    console.error('\n✗ QuestionPaper Model Test Failed:', error);
    throw error;
  }
};

/**
 * Run all tests
 */
const runAllTests = async () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Mongoose Models Test Suite                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Run tests
    await testAssessmentModel();
    await testQuestionPaperModel();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              ✓ All Tests Passed!                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    process.exit(0);

  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════════╗');
    console.error('║              ✗ Tests Failed!                              ║');
    console.error('╚════════════════════════════════════════════════════════════╝\n');
    console.error(error);
    process.exit(1);

  } finally {
    await mongoose.disconnect();
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

export { testAssessmentModel, testQuestionPaperModel };
