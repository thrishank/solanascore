export interface StreakAnalysis {
  uniqueDays: number;
  longestStreak: number;
  currentStreak: number;
  longestStreakDates?: {
    start: string;
    end: string;
  };
  currentStreakDates?: {
    start: string;
    end: string;
  };
  counts: Record<number, number>;
}

export function analyzeTransactionStreaks(
  timestamps: number[]
): StreakAnalysis {
  if (!timestamps || timestamps.length === 0) {
    return {
      counts: {},
      uniqueDays: 0,
      longestStreak: 0,
      currentStreak: 0,
    };
  }

  const dates = timestamps.map(
    (ts) => new Date(ts * 1000).toISOString().split("T")[0]
  );
  const uniqueDays = new Set(dates).size;
  const sortedUniqueDates = Array.from(new Set(dates)).sort().reverse();
  const sortedDates = sortedUniqueDates.map((date) => new Date(date));

  let currentStreak = 0;
  let currentStreakDates: { start: string; end: string } | undefined;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      currentStreak = 1;
      currentStreakDates = {
        start: sortedDates[i].toISOString().split("T")[0],
        end: sortedDates[i].toISOString().split("T")[0],
      };
    } else {
      const dayDifference =
        (sortedDates[i - 1].getTime() - sortedDates[i].getTime()) /
        (1000 * 3600 * 24);

      if (dayDifference === 1) {
        currentStreak++;
        currentStreakDates!.start = sortedDates[i].toISOString().split("T")[0];
      } else {
        if (currentStreak === 1) {
          currentStreakDates!.end = currentStreakDates!.start;
        }
        break;
      }
    }
  }

  let longestStreak = 0;
  let currentPotentialStreak = 1;
  let longestStreakDates: { start: string; end: string } | undefined;
  let currentStreakStartDate = sortedDates[0];
  let currentStreakEndDate = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const dayDifference =
      (sortedDates[i - 1].getTime() - sortedDates[i].getTime()) /
      (1000 * 3600 * 24);

    if (dayDifference === 1) {
      currentPotentialStreak++;
      currentStreakEndDate = sortedDates[i - 1];
    } else {
      if (currentPotentialStreak > longestStreak) {
        longestStreak = currentPotentialStreak;
        longestStreakDates = {
          start: currentStreakStartDate.toISOString().split("T")[0],
          end: currentStreakEndDate.toISOString().split("T")[0],
        };
      }
      currentPotentialStreak = 1;
      currentStreakStartDate = sortedDates[i];
      currentStreakEndDate = sortedDates[i];
    }
  }

  if (currentPotentialStreak > longestStreak) {
    longestStreak = currentPotentialStreak;
    longestStreakDates = {
      start: currentStreakStartDate.toISOString().split("T")[0],
      end: sortedDates[sortedDates.length - 1].toISOString().split("T")[0],
    };
  }

  const counts: Record<number, number> = {};
  timestamps.forEach((ts) => {
    const date = new Date(ts * 1000);
    const month = date.getMonth() + 1;

    if (!counts[month]) {
      counts[month] = 0;
    }
    counts[month]++;
  });

  return {
    uniqueDays,
    longestStreak,
    currentStreak,
    longestStreakDates,
    currentStreakDates,
    counts,
  };
}
