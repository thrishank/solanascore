interface Input {
  programId: string[];
  time: number;
}

interface MonthCount {
  month: number;
  count: number;
}

export interface ProgramIdDetailedCount {
  programId: string;
  overallCount: number;
  month: MonthCount[];
}

export function countProgramIds(inputs: Input[]): ProgramIdDetailedCount[] {
  const monthlyProgramCountMap = new Map<string, Map<number, number>>();

  const overallProgramCountMap = new Map<string, number>();

  inputs.forEach((input) => {
    const date = new Date(input.time * 1000);
    const monthKey = date.getMonth() + 1;

    input.programId.forEach((programId) => {
      if (!monthlyProgramCountMap.has(programId)) {
        monthlyProgramCountMap.set(programId, new Map());
      }

      const monthMap = monthlyProgramCountMap.get(programId)!;

      const currentCount = monthMap.get(monthKey) || 0;
      monthMap.set(monthKey, currentCount + 1);

      const overallCount = overallProgramCountMap.get(programId) || 0;
      overallProgramCountMap.set(programId, overallCount + 1);
    });
  });

  const detailedProgramCounts: ProgramIdDetailedCount[] = [];

  monthlyProgramCountMap.forEach((monthMap, programId) => {
    const monthCounts: MonthCount[] = Array.from(
      { length: 12 },
      (_, index) => ({
        month: index + 1,
        count: monthMap.get(index + 1) || 0,
      })
    );

    detailedProgramCounts.push({
      programId,
      overallCount: overallProgramCountMap.get(programId) || 0,
      month: monthCounts,
    });
  });

  return detailedProgramCounts.sort((a, b) => b.overallCount - a.overallCount);
}

export function calculateProgramScore(
  programData: ProgramIdDetailedCount
): number {
  const MAX_SCORE = 6;

  const { overallCount, month } = programData;

  const MAX_OVERALL_COUNT = 300;
  const CONSISTENCY_WEIGHT = 0.3;
  const PEAK_WEIGHT = 0.4;
  const SPREAD_WEIGHT = 0.3;

  // Calculate consistency: standard deviation of monthly counts (lower is better)
  const counts = month.map((m) => m.count);
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance =
    counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) /
    counts.length;
  const standardDeviation = Math.sqrt(variance);
  const consistencyScore = 1 - Math.min(standardDeviation / mean, 1); // Normalize to [0, 1]

  // Calculate engagement peaks: maximum participation in a single month
  const peakCount = Math.max(...counts);
  const peakScore = Math.min(peakCount / (MAX_OVERALL_COUNT / 12), 1); // Normalize to [0, 1]

  // Calculate participation spread: number of months with activity
  const activeMonths = counts.filter((count) => count > 0).length;
  const spreadScore = activeMonths / 12; // Normalize to [0, 1]

  // Calculate the overall engagement score (normalize overallCount)
  const overallEngagementScore = Math.min(overallCount / MAX_OVERALL_COUNT, 1);

  // Combine scores with weights
  const weightedScore =
    CONSISTENCY_WEIGHT * consistencyScore +
    PEAK_WEIGHT * peakScore +
    SPREAD_WEIGHT * spreadScore;

  // Scale to MAX_SCORE and round to integer
  const finalScore = Math.round(
    ((weightedScore + overallEngagementScore) / 2) * MAX_SCORE
  );

  return finalScore;
}
