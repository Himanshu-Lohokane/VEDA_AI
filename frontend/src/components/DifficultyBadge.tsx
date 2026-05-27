import { DifficultyLevel } from '@/types';

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
}

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const colorClasses = {
    [DifficultyLevel.EASY]: 'bg-green-100 text-green-700 border-green-300',
    [DifficultyLevel.MODERATE]: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    [DifficultyLevel.HARD]: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[difficulty]}`}>
      {difficulty}
    </span>
  );
}
