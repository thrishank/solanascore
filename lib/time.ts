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
  dayCount: { date: string; count: number }[];
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
      dayCount: [],
    };
  }

  const dates = timestamps.map(
    (ts) => new Date(ts * 1000).toISOString().split("T")[0]
  );
  const uniqueDays = new Set(dates).size;
  const sortedUniqueDates = Array.from(new Set(dates)).sort();
  const sortedDates = sortedUniqueDates.map((date) => new Date(date));

  let currentStreak = 0;
  let currentStreakDates: { start: string; end: string } | undefined;
  let longestStreak = 0;
  let longestStreakDates: { start: string; end: string } | undefined;

  let tempStreak = 1;
  let tempStart = sortedDates[0];
  let tempEnd = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const dayDifference =
      (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) /
      (1000 * 3600 * 24);

    if (dayDifference === 1) {
      tempStreak++;
      tempEnd = sortedDates[i];
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestStreakDates = {
          start: tempStart.toISOString().split("T")[0],
          end: tempEnd.toISOString().split("T")[0],
        };
      }
      tempStreak = 1;
      tempStart = sortedDates[i];
    }
  }

  // Handle the case where the longest streak ends with the last date
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
    longestStreakDates = {
      start: tempStart.toISOString().split("T")[0],
      end: tempEnd.toISOString().split("T")[0],
    };
  }

  // Calculate the current streak
  const today = new Date();
  const lastDate = sortedDates[sortedDates.length - 1];
  const daysSinceLast =
    (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);

  if (daysSinceLast <= 1) {
    currentStreak = tempStreak;
    currentStreakDates = {
      start: tempStart.toISOString().split("T")[0],
      end: tempEnd.toISOString().split("T")[0],
    };
  }

  const counts: Record<number, number> = {};
  const dayCount: { date: string; count: number }[] = [];

  timestamps.forEach((ts) => {
    const date = new Date(ts * 1000).toISOString().split("T")[0];
    const month = new Date(ts * 1000).getMonth() + 1;

    if (!counts[month]) {
      counts[month] = 0;
    }
    counts[month]++;

    const dayEntry = dayCount.find((entry) => entry.date === date);
    if (dayEntry) {
      dayEntry.count++;
    } else {
      dayCount.push({ date, count: 1 });
    }
  });

  return {
    uniqueDays,
    longestStreak,
    currentStreak,
    longestStreakDates,
    currentStreakDates,
    counts,
    dayCount,
  };
}
