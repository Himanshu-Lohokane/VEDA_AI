/**
 * Manual test script for QuestionGeneratorService
 * Run this with: npx ts-node src/services/questionGenerator.service.test.ts
 * 
 * Prerequisites:
 * - OPENROUTER_API_KEY environment variable must be set
 */

import { QuestionGeneratorService } from './questionGenerator.service';
import { AssessmentFormData, QuestionType, DifficultyLevel } from '../types';

const testQuestionGeneratorService = async () => {
  console.log('=== Testing QuestionGeneratorService ===\n');

  let questionGeneratorService: QuestionGeneratorService;

  try {
    // Test 1: Initialize service
    console.log('Test 1: Initializing QuestionGeneratorService...');
    questionGeneratorService = new QuestionGeneratorService();
    console.log('✓ Test 1 passed\n');

    // Test 2: Test prompt construction without file content
    console.log('Test 2: Testing prompt construction without file content...');
    const formData: AssessmentFormData = {
      dueDate: '2024-12-31',
      questionTypes: [QuestionType.MULTIPLE_CHOICE, QuestionType.SHORT_ANSWER],
      numberOfQuestions: 5,
      marksPerQuestion: 2,
      additionalInstructions: 'Focus on chapters 1-3'
    };

    const prompt = (questionGeneratorService as any).constructPrompt(formData, undefined);
    
    if (!prompt.includes('5') || !prompt.includes('2') || !prompt.includes('Focus on chapters 1-3')) {
      throw new Error('Prompt does not contain expected form data');
    }
    if (!prompt.includes('multiple_choice') || !prompt.includes('short_answer')) {
      throw new Error('Prompt does not contain expected question types');
    }
    console.log('✓ Test 2 passed\n');

    // Test 3: Test prompt construction with file content
    console.log('Test 3: Testing prompt construction with file content...');
    const fileContent = 'This is reference material about biology.';
    const promptWithFile = (questionGeneratorService as any).constructPrompt(formData, fileContent);
    
    if (!promptWithFile.includes(fileContent)) {
      throw new Error('Prompt does not include file content');
    }
    console.log('✓ Test 3 passed\n');

    // Test 4: Test difficulty normalization
    console.log('Test 4: Testing difficulty normalization...');
    const normalizeDifficulty = (questionGeneratorService as any).normalizeDifficulty.bind(questionGeneratorService);
    
    if (normalizeDifficulty('easy') !== DifficultyLevel.EASY) {
      throw new Error('Failed to normalize "easy"');
    }
    if (normalizeDifficulty('MODERATE') !== DifficultyLevel.MODERATE) {
      throw new Error('Failed to normalize "MODERATE"');
    }
    if (normalizeDifficulty('Hard') !== DifficultyLevel.HARD) {
      throw new Error('Failed to normalize "Hard"');
    }
    
    try {
      normalizeDifficulty('invalid');
      throw new Error('Should have thrown error for invalid difficulty');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('Invalid difficulty level')) {
        throw error;
      }
    }
    console.log('✓ Test 4 passed\n');

    // Test 5: Test question type normalization
    console.log('Test 5: Testing question type normalization...');
    const normalizeQuestionType = (questionGeneratorService as any).normalizeQuestionType.bind(questionGeneratorService);
    
    if (normalizeQuestionType('multiple_choice') !== QuestionType.MULTIPLE_CHOICE) {
      throw new Error('Failed to normalize "multiple_choice"');
    }
    if (normalizeQuestionType('SHORT_ANSWER') !== QuestionType.SHORT_ANSWER) {
      throw new Error('Failed to normalize "SHORT_ANSWER"');
    }
    if (normalizeQuestionType('essay') !== QuestionType.ESSAY) {
      throw new Error('Failed to normalize "essay"');
    }
    if (normalizeQuestionType('true_false') !== QuestionType.TRUE_FALSE) {
      throw new Error('Failed to normalize "true_false"');
    }
    if (normalizeQuestionType('fill_in_blank') !== QuestionType.FILL_IN_BLANK) {
      throw new Error('Failed to normalize "fill_in_blank"');
    }
    
    try {
      normalizeQuestionType('invalid_type');
      throw new Error('Should have thrown error for invalid question type');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('Invalid question type')) {
        throw error;
      }
    }
    console.log('✓ Test 5 passed\n');

    // Test 6: Test adding question IDs
    console.log('Test 6: Testing question ID generation...');
    const addQuestionIds = (questionGeneratorService as any).addQuestionIds.bind(questionGeneratorService);
    
    const sections = [
      {
        label: 'A',
        title: 'Section A',
        questions: [
          {
            id: '',
            text: 'Question 1',
            difficulty: DifficultyLevel.EASY,
            marks: 2,
            type: QuestionType.MULTIPLE_CHOICE
          },
          {
            id: '',
            text: 'Question 2',
            difficulty: DifficultyLevel.MODERATE,
            marks: 2,
            type: QuestionType.SHORT_ANSWER
          }
        ]
      }
    ];

    const sectionsWithIds = addQuestionIds(sections);
    
    if (!sectionsWithIds[0].questions[0].id || sectionsWithIds[0].questions[0].id === '') {
      throw new Error('Question ID was not generated');
    }
    if (sectionsWithIds[0].questions[0].id === sectionsWithIds[0].questions[1].id) {
      throw new Error('Question IDs are not unique');
    }
    console.log('✓ Test 6 passed\n');

    // Test 7: Test total marks calculation
    console.log('Test 7: Testing total marks calculation...');
    const calculateTotalMarks = (questionGeneratorService as any).calculateTotalMarks.bind(questionGeneratorService);
    
    const totalMarks = calculateTotalMarks(sectionsWithIds);
    if (totalMarks !== 4) {
      throw new Error(`Expected total marks to be 4, got ${totalMarks}`);
    }
    console.log('✓ Test 7 passed\n');

    // Test 8: Test response parsing with valid JSON
    console.log('Test 8: Testing response parsing with valid JSON...');
    const parseResponse = (questionGeneratorService as any).parseResponse.bind(questionGeneratorService);
    
    const validResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              sections: [
                {
                  label: 'A',
                  title: 'Section A',
                  instructions: 'Answer all questions',
                  questions: [
                    {
                      text: 'What is 2+2?',
                      difficulty: 'Easy',
                      marks: 2,
                      type: 'multiple_choice'
                    }
                  ]
                }
              ]
            })
          }
        }
      ]
    };

    const parsedSections = parseResponse(validResponse);
    if (parsedSections.length !== 1) {
      throw new Error('Expected 1 section');
    }
    if (parsedSections[0].label !== 'A') {
      throw new Error('Section label is incorrect');
    }
    if (parsedSections[0].questions.length !== 1) {
      throw new Error('Expected 1 question');
    }
    if (parsedSections[0].questions[0].difficulty !== DifficultyLevel.EASY) {
      throw new Error('Difficulty was not normalized');
    }
    console.log('✓ Test 8 passed\n');

    // Test 9: Test response parsing with markdown code blocks
    console.log('Test 9: Testing response parsing with markdown code blocks...');
    const responseWithMarkdown = {
      choices: [
        {
          message: {
            content: `Here's the question paper:
\`\`\`json
${JSON.stringify({
  sections: [
    {
      label: 'B',
      title: 'Section B',
      questions: [
        {
          text: 'Essay question',
          difficulty: 'Hard',
          marks: 5,
          type: 'essay'
        }
      ]
    }
  ]
})}
\`\`\``
          }
        }
      ]
    };

    const parsedFromMarkdown = parseResponse(responseWithMarkdown);
    if (parsedFromMarkdown.length !== 1 || parsedFromMarkdown[0].label !== 'B') {
      throw new Error('Failed to parse JSON from markdown code blocks');
    }
    console.log('✓ Test 9 passed\n');

    // Test 10: Test response validation
    console.log('Test 10: Testing response validation...');
    const validateResponseStructure = (questionGeneratorService as any).validateResponseStructure.bind(questionGeneratorService);
    
    const validFormData: AssessmentFormData = {
      dueDate: '2024-12-31',
      questionTypes: [QuestionType.MULTIPLE_CHOICE, QuestionType.ESSAY],
      numberOfQuestions: 2,
      marksPerQuestion: 5,
      additionalInstructions: 'Test'
    };

    const validSections = [
      {
        label: 'A',
        title: 'Section A',
        questions: [
          {
            id: '1',
            text: 'Q1',
            difficulty: DifficultyLevel.EASY,
            marks: 5,
            type: QuestionType.MULTIPLE_CHOICE
          },
          {
            id: '2',
            text: 'Q2',
            difficulty: DifficultyLevel.HARD,
            marks: 5,
            type: QuestionType.ESSAY
          }
        ]
      }
    ];

    // Should not throw
    validateResponseStructure(validSections, validFormData);
    console.log('✓ Test 10 passed\n');

    // Test 11: Test validation with wrong question count
    console.log('Test 11: Testing validation with wrong question count...');
    const invalidSections = [
      {
        label: 'A',
        title: 'Section A',
        questions: [
          {
            id: '1',
            text: 'Q1',
            difficulty: DifficultyLevel.EASY,
            marks: 5,
            type: QuestionType.MULTIPLE_CHOICE
          }
        ]
      }
    ];

    try {
      validateResponseStructure(invalidSections, validFormData);
      throw new Error('Should have thrown error for wrong question count');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('Expected 2 questions')) {
        throw error;
      }
    }
    console.log('✓ Test 11 passed\n');

    // Test 12: Test validation with wrong marks
    console.log('Test 12: Testing validation with wrong marks...');
    const wrongMarksSections = [
      {
        label: 'A',
        title: 'Section A',
        questions: [
          {
            id: '1',
            text: 'Q1',
            difficulty: DifficultyLevel.EASY,
            marks: 3,
            type: QuestionType.MULTIPLE_CHOICE
          },
          {
            id: '2',
            text: 'Q2',
            difficulty: DifficultyLevel.HARD,
            marks: 5,
            type: QuestionType.ESSAY
          }
        ]
      }
    ];

    try {
      validateResponseStructure(wrongMarksSections, validFormData);
      throw new Error('Should have thrown error for wrong marks');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('does not match expected marks')) {
        throw error;
      }
    }
    console.log('✓ Test 12 passed\n');

    // Test 13: Test validation with invalid question type
    console.log('Test 13: Testing validation with invalid question type...');
    const invalidTypeSections = [
      {
        label: 'A',
        title: 'Section A',
        questions: [
          {
            id: '1',
            text: 'Q1',
            difficulty: DifficultyLevel.EASY,
            marks: 5,
            type: QuestionType.TRUE_FALSE
          },
          {
            id: '2',
            text: 'Q2',
            difficulty: DifficultyLevel.HARD,
            marks: 5,
            type: QuestionType.ESSAY
          }
        ]
      }
    ];

    try {
      validateResponseStructure(invalidTypeSections, validFormData);
      throw new Error('Should have thrown error for invalid question type');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('not in requested types')) {
        throw error;
      }
    }
    console.log('✓ Test 13 passed\n');

    // Test 14: Test initialization without API key
    console.log('Test 14: Testing initialization without API key...');
    const originalKey = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    
    try {
      new QuestionGeneratorService();
      throw new Error('Should have thrown error when API key is missing');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('OPENROUTER_API_KEY')) {
        throw error;
      }
    }
    
    // Restore API key
    if (originalKey) {
      process.env.OPENROUTER_API_KEY = originalKey;
    }
    console.log('✓ Test 14 passed\n');

    console.log('=== All tests passed! ===');
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  }
};

// Run the test
testQuestionGeneratorService();
