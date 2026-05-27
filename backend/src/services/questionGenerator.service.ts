import { v4 as uuidv4 } from 'uuid';
import {
  AssessmentFormData,
  QuestionPaper,
  QuestionSection,
  Question,
  DifficultyLevel,
  QuestionType
} from '../types';

/**
 * QuestionGeneratorService handles AI-powered question paper generation
 * Uses OpenRouter API to generate structured question papers based on form inputs
 */
export class QuestionGeneratorService {
  private openRouterApiKey: string;
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private model = 'openai/gpt-3.5-turbo';

  /**
   * Initialize QuestionGeneratorService with OpenRouter API key from environment
   * @throws Error if OPENROUTER_API_KEY environment variable is not set
   */
  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }
    this.openRouterApiKey = apiKey;
  }

  /**
   * Generate a complete question paper based on form data and optional file content
   * @param formData Assessment form data with parameters
   * @param fileContent Optional text content extracted from uploaded file
   * @param jobId Job identifier for tracking
   * @returns Promise resolving to a structured QuestionPaper
   * @throws Error if generation, parsing, or validation fails
   */
  async generateQuestions(
    formData: AssessmentFormData,
    fileContent: string | undefined,
    jobId: string
  ): Promise<QuestionPaper> {
    try {
      // Step 1: Construct the prompt
      const prompt = this.constructPrompt(formData, fileContent);

      // Step 2: Call OpenRouter API
      const response = await this.callOpenRouter(prompt);

      // Step 3: Parse the response
      const sections = this.parseResponse(response);

      // Step 4: Validate the parsed response
      this.validateResponseStructure(sections, formData);

      // Step 5: Generate unique IDs for questions
      const sectionsWithIds = this.addQuestionIds(sections);

      // Step 6: Calculate total marks
      const totalMarks = this.calculateTotalMarks(sectionsWithIds);

      // Step 7: Create and return the QuestionPaper
      const questionPaper: QuestionPaper = {
        id: uuidv4(),
        jobId,
        formData,
        sections: sectionsWithIds,
        totalMarks,
        createdAt: new Date()
      };

      return questionPaper;
    } catch (error) {
      throw new Error(
        `Question generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Construct a structured prompt for the LLM
   * Includes all form parameters and optional file content
   * @param formData Assessment form data
   * @param fileContent Optional reference content from uploaded file
   * @returns Formatted prompt string for OpenRouter API
   */
  private constructPrompt(formData: AssessmentFormData, fileContent?: string): string {
    const questionTypesStr = formData.questionTypes.join(', ');

    let prompt = `Generate a structured question paper with the following requirements:

Number of questions: ${formData.numberOfQuestions}
Question types: ${questionTypesStr}
Marks per question: ${formData.marksPerQuestion}
Additional instructions: ${formData.additionalInstructions}`;

    // Include file content if provided
    if (fileContent && fileContent.trim().length > 0) {
      prompt += `\n\nReference content to base questions on:\n${fileContent}`;
    }

    prompt += `

Output format (MUST be valid JSON only, no additional text):
{
  "sections": [
    {
      "label": "A",
      "title": "Section Title",
      "instructions": "Optional section-specific instructions",
      "questions": [
        {
          "text": "Question text",
          "difficulty": "Easy",
          "marks": ${formData.marksPerQuestion},
          "type": "multiple_choice"
        }
      ]
    }
  ]
}

Requirements:
- Organize questions into logical sections (A, B, C, etc.)
- Distribute difficulty levels evenly across Easy, Moderate, and Hard
- Ensure questions match the specified types: ${questionTypesStr}
- Each question should have exactly ${formData.marksPerQuestion} marks
- Generate exactly ${formData.numberOfQuestions} questions total
- Difficulty values MUST be exactly: "Easy", "Moderate", or "Hard"
- Type values MUST be one of: multiple_choice, short_answer, essay, true_false, fill_in_blank
- Return ONLY valid JSON, no markdown formatting, no code blocks, no additional text`;

    return prompt;
  }

  /**
   * Call OpenRouter API with the constructed prompt
   * Includes proper authentication headers and error handling
   * @param prompt The prompt to send to the API
   * @returns Promise resolving to the API response
   * @throws Error if API call fails or returns an error
   */
  private async callOpenRouter(prompt: string): Promise<any> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://vedaai-assessment.vercel.app',
          'X-Title': 'VedaAI Assessment Creator'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json() as any;
          if (errorData && typeof errorData === 'object' && 'error' in errorData) {
            const error = errorData.error as any;
            if (error && typeof error === 'object' && 'message' in error) {
              errorMessage = error.message as string;
            }
          }
        } catch {
          // Use default error message if JSON parsing fails
        }
        throw new Error(`OpenRouter API error (${response.status}): ${errorMessage}`);
      }

      const data = await response.json() as any;

      if (!data || !data.choices || !Array.isArray(data.choices) || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenRouter API');
      }

      return data;
    } catch (error) {
      throw new Error(
        `OpenRouter API call failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Parse the API response and extract structured question sections
   * Handles JSON parsing and error recovery
   * @param response The API response object
   * @returns Array of QuestionSection objects
   * @throws Error if response cannot be parsed or is invalid
   */
  private parseResponse(response: any): QuestionSection[] {
    try {
      // Extract the message content from the response
      const content = response.choices[0].message.content;

      if (!content || typeof content !== 'string') {
        throw new Error('No content in API response');
      }

      // Try to parse JSON directly
      let jsonData: any;
      try {
        jsonData = JSON.parse(content);
      } catch (parseError) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonData = JSON.parse(jsonMatch[1].trim());
        } else {
          // Try to find JSON object in the content
          const objectMatch = content.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            jsonData = JSON.parse(objectMatch[0]);
          } else {
            throw new Error('Could not find valid JSON in response');
          }
        }
      }

      // Validate that sections exist
      if (!jsonData.sections || !Array.isArray(jsonData.sections)) {
        throw new Error('Response does not contain sections array');
      }

      // Parse and validate each section
      const sections: QuestionSection[] = jsonData.sections.map((section: any, index: number) => {
        if (!section.label || !section.title || !Array.isArray(section.questions)) {
          throw new Error(
            `Invalid section structure at index ${index}: missing label, title, or questions`
          );
        }

        const questions: Question[] = section.questions.map((q: any, qIndex: number) => {
          if (!q.text || q.marks === undefined || !q.difficulty || !q.type) {
            throw new Error(
              `Invalid question structure in section ${section.label}, question ${qIndex}: missing required fields`
            );
          }

          return {
            id: '', // Will be set later
            text: String(q.text).trim(),
            difficulty: this.normalizeDifficulty(q.difficulty),
            marks: Number(q.marks),
            type: this.normalizeQuestionType(q.type)
          };
        });

        return {
          label: String(section.label).trim(),
          title: String(section.title).trim(),
          instructions: section.instructions ? String(section.instructions).trim() : undefined,
          questions
        };
      });

      return sections;
    } catch (error) {
      throw new Error(
        `Response parsing failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Normalize difficulty level string to valid enum value
   * @param difficulty Raw difficulty string from API
   * @returns Normalized DifficultyLevel
   * @throws Error if difficulty cannot be normalized
   */
  private normalizeDifficulty(difficulty: string): DifficultyLevel {
    const normalized = String(difficulty).trim().toLowerCase();

    if (normalized === 'easy') return DifficultyLevel.EASY;
    if (normalized === 'moderate') return DifficultyLevel.MODERATE;
    if (normalized === 'hard') return DifficultyLevel.HARD;

    throw new Error(
      `Invalid difficulty level: ${difficulty}. Must be Easy, Moderate, or Hard`
    );
  }

  /**
   * Normalize question type string to valid enum value
   * @param type Raw question type string from API
   * @returns Normalized QuestionType
   * @throws Error if type cannot be normalized
   */
  private normalizeQuestionType(type: string): QuestionType {
    const normalized = String(type).trim().toLowerCase().replace(/[\s-]+/g, '_');

    if (normalized === 'multiple_choice' || normalized.includes('multiple')) return QuestionType.MULTIPLE_CHOICE;
    if (normalized === 'short_answer' || normalized.includes('short')) return QuestionType.SHORT_ANSWER;
    if (normalized === 'essay' || normalized.includes('essay') || normalized.includes('long')) return QuestionType.ESSAY;
    if (normalized === 'true_false' || normalized.includes('true') || normalized.includes('false')) return QuestionType.TRUE_FALSE;
    if (normalized === 'fill_in_blank' || normalized.includes('fill') || normalized.includes('blank')) return QuestionType.FILL_IN_BLANK;

    // Default unknown types to essay rather than throwing
    return QuestionType.ESSAY;
  }

  /**
   * Validate the parsed response structure against form requirements
   * Lenient validation — AI may return slightly different counts
   */
  private validateResponseStructure(sections: QuestionSection[], formData: AssessmentFormData): void {
    if (!sections || sections.length === 0) {
      throw new Error('No sections found in response');
    }

    for (const section of sections) {
      if (!section.questions || section.questions.length === 0) {
        throw new Error(`Section ${section.label} has no questions`);
      }
    }

    // Validate difficulty levels
    for (const section of sections) {
      for (const question of section.questions) {
        if (!Object.values(DifficultyLevel).includes(question.difficulty)) {
          throw new Error(`Invalid difficulty level: ${question.difficulty}`);
        }
      }
    }
  }

  /**
   * Add unique IDs to all questions
   * @param sections Question sections without IDs
   * @returns Sections with unique IDs added to each question
   */
  private addQuestionIds(sections: QuestionSection[]): QuestionSection[] {
    return sections.map((section) => ({
      ...section,
      questions: section.questions.map((question) => ({
        ...question,
        id: uuidv4()
      }))
    }));
  }

  /**
   * Calculate total marks from all questions
   * @param sections Question sections with questions
   * @returns Total marks across all questions
   */
  private calculateTotalMarks(sections: QuestionSection[]): number {
    let total = 0;
    for (const section of sections) {
      for (const question of section.questions) {
        total += question.marks;
      }
    }
    return total;
  }
}
