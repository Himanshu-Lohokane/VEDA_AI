import { QuestionSection as QuestionSectionType } from '@/types';
import DifficultyBadge from './DifficultyBadge';

interface QuestionSectionProps {
  section: QuestionSectionType;
  startIndex: number;
}

export default function QuestionSection({ section, startIndex }: QuestionSectionProps) {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Section {section.label}: {section.title}
        </h2>
        {section.instructions && (
          <p className="text-sm text-gray-600 italic">{section.instructions}</p>
        )}
      </div>

      <div className="space-y-4">
        {section.questions.map((question, index) => (
          <div key={question.id} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-gray-900">
                  <span className="font-semibold">{startIndex + index + 1}.</span> {question.text}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <DifficultyBadge difficulty={question.difficulty} />
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  [{question.marks} {question.marks === 1 ? 'mark' : 'marks'}]
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
