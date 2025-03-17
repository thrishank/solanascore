import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActivityCalendar from "react-activity-calendar";
import { Tooltip as MuiTooltip } from "@mui/material";

const getLevel = (count: number): number => {
  if (count >= 15) return 4;
  if (count >= 5) return 3;
  if (count >= 2) return 2;
  if (count >= 1) return 1;
  return 0;
};

function generateYearData(
  inputData: { date: string; count: number }[],
): { date: string; count: number; level: number }[] {
  const yearData: { date: string; count: number; level: number }[] = [];

  let startDate = new Date(); // Start date: today
  let endDate = new Date(); // End date: one year backward from today
  endDate.setFullYear(endDate.getFullYear() - 1);

  // Ensure proper date loop
  if (startDate < endDate) {
    [startDate, endDate] = [endDate, startDate];
  }

  for (let d = new Date(startDate); d >= endDate; d.setDate(d.getDate() - 1)) {
    const dateString = d.toISOString().split("T")[0];
    const existingData = inputData.find((item) => item.date === dateString);
    const count = existingData ? existingData.count : 0;
    yearData.push({
      date: dateString,
      count,
      level: getLevel(count),
    });
  }

  yearData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  return yearData;
}

export default function TxGraph({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  const yearData = generateYearData(data);
  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
          Transaction Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <ActivityCalendar
          data={yearData.map((item) => ({
            date: item.date,
            count: item.count,
            level: item.level,
          }))}
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
          blockSize={10}
          blockMargin={2}
          fontSize={12}
          theme={{
            light: ["#EAEDF0", "#C6E48B", "#7BC96F", "#239A3B", "#196127"],
            dark: ["#EAEDF0", "#C6E48B", "#7BC96F", "#239A3B", "#196127"],
          }}
          maxLevel={4}
          hideTotalCount={true}
        />
      </CardContent>
    </Card>
  );
}
