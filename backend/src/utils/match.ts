export type MatchInput = {
  id: string;
  name: string;
  school?: string | null;
  teaches: string[];
  learns: string[];
};

export type MatchResult = {
  userId: string;
  name: string;
  school?: string | null;
  teachToLearnOverlap: string[];
  learnToTeachOverlap: string[];
  score: number;
};

const normalize = (value: string): string => value.trim().toLowerCase();

export const buildMatches = (me: MatchInput, pool: MatchInput[]): MatchResult[] => {
  const myTeachSet = new Set(me.teaches.map(normalize));
  const myLearnSet = new Set(me.learns.map(normalize));

  const results: MatchResult[] = [];

  for (const other of pool) {
    const otherTeach = new Set(other.teaches.map(normalize));
    const otherLearn = new Set(other.learns.map(normalize));

    const teachToLearnOverlap = [...myLearnSet].filter((skill) => otherTeach.has(skill));
    const learnToTeachOverlap = [...myTeachSet].filter((skill) => otherLearn.has(skill));

    const score = teachToLearnOverlap.length * 2 + learnToTeachOverlap.length * 2;
    if (score > 0) {
      results.push({
        userId: other.id,
        name: other.name,
        school: other.school,
        teachToLearnOverlap,
        learnToTeachOverlap,
        score
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
};
