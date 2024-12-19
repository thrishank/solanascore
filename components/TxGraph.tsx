import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActivityCalendar from "react-activity-calendar";
import { Tooltip as MuiTooltip } from "@mui/material";

interface InputData {
  date: string;
  count: number;
}

interface YearData {
  date: string;
  count: number;
  level: number;
}

function generateYearData(inputData: InputData[]): YearData[] {
  const getLevel = (count: number): number => {
    if (count >= 15) return 4;
    if (count >= 5) return 3;
    if (count >= 2) return 2;
    if (count >= 1) return 1;
    return 0;
  };

  const yearData: YearData[] = [];
  const startDate = new Date(new Date().getFullYear(), 0, 1);
  const endDate = new Date(new Date().getFullYear(), 11, 31);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateString = d.toISOString().split("T")[0];
    const existingData = inputData.find((item) => item.date === dateString);
    const count = existingData ? existingData.count : 0;
    yearData.push({
      date: dateString,
      count,
      level: getLevel(count),
    });
  }

  return yearData;
}

export default function TxGraph({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  const yearData = generateYearData(data);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800  ">
          Transaction Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mx-auto flex justify-center overflow-hidden">
          <ActivityCalendar
            data={yearData.map((item) => ({
              date: item.date,
              count: item.count,
              level: item.level,
            }))}
            renderBlock={(block, activity) => (
              <MuiTooltip
                title={`${activity.count} Transactions on ${activity.date}`}
                className="cursor-pointer"
              >
                {block}
              </MuiTooltip>
            )}
            renderColorLegend={(block, level) => (
              <MuiTooltip title={`Level: ${level}`}>{block}</MuiTooltip>
            )}
            labels={{
              months: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
              weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            }}
            blockSize={8}
            blockMargin={4}
            theme={{
              light: ["#EAEDF0", "#C6E48B", "#7BC96F", "#239A3B", "#196127"],
              dark: ["#EAEDF0", "#C6E48B", "#7BC96F", "#239A3B", "#196127"],
            }}
            maxLevel={4}
            hideTotalCount={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
