export interface StreakAnalysis {
  uniqueDays: number;
  longestStreak: number;
  currentStreak: number;
  longestStreakDates?: {
    start: Date;
    end: Date;
  };
  currentStreakDates?: {
    start: Date;
    end: Date;
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

  // Convert timestamps to dates and get unique sorted dates
  const dates = timestamps.map(
    (ts) => new Date(ts * 1000).toISOString().split("T")[0]
  );
  const uniqueDays = new Set(dates).size;
  const sortedUniqueDates = Array.from(new Set(dates)).sort();
  const sortedDates = sortedUniqueDates.map((date) => new Date(date));

  let currentStreak = 0;
  let currentStreakDates: { start: Date; end: Date } | undefined;
  let longestStreak = 0;
  let longestStreakDates: { start: Date; end: Date } | undefined;

  // Initialize streaks
  let tempStreak = 1;
  let tempStart = sortedDates[0];
  let tempEnd = sortedDates[0];

  // Calculate streaks
  for (let i = 1; i < sortedDates.length; i++) {
    const dayDifference = Math.round(
      (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) /
        (1000 * 3600 * 24)
    );

    if (dayDifference === 1) {
      tempStreak++;
      tempEnd = sortedDates[i];
    } else {
      // Check if current tempStreak is the longest before resetting
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestStreakDates = {
          start: new Date(tempStart),
          end: new Date(tempEnd),
        };
      }
      tempStreak = 1;
      tempStart = sortedDates[i];
      tempEnd = sortedDates[i];
    }
  }

  // Check one last time for longest streak
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
    longestStreakDates = {
      start: new Date(tempStart),
      end: new Date(tempEnd),
    };
  }

  // Calculate current streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);
  lastDate.setHours(0, 0, 0, 0);

  const daysSinceLast = Math.round(
    (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
  );

  if (daysSinceLast <= 1) {
    currentStreak = tempStreak;
    currentStreakDates = {
      start: new Date(tempStart),
      end: daysSinceLast === 0 ? new Date(tempEnd) : today,
    };
  } else {
    currentStreak = 0;
    currentStreakDates = undefined;
  }

  // Calculate counts per month and per day
  const counts: Record<number, number> = {};
  const dayCount: { date: string; count: number }[] = [];

  timestamps.forEach((ts) => {
    const date = new Date(ts * 1000).toISOString().split("T")[0];
    const month = new Date(ts * 1000).getMonth() + 1;

    counts[month] = (counts[month] || 0) + 1;

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
