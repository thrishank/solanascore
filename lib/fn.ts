import { ProgramIdDetailedCount } from "./program";

export function getProgramCount(
  data: ProgramIdDetailedCount[],
  targetProgramId: string
): number {
  const program = data.find((item) => item.programId === targetProgramId);
  return program?.overallCount ?? 0;
}

export const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return "N/A";

  const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
};

export function getMostTransactionsData(data: { date: string; count: number }[]) {
    const result = {
      date: "",
      count: 0,
    };
  
    for (let i = 0; i < data.length; i++) {
      if (data[i].count > result.count) {
        result.date = data[i].date;
        result.count = data[i].count;
      }
    }
    return result;
  }
  