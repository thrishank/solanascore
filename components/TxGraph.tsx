import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActivityCalendar from "react-activity-calendar";
import { Tooltip as MuiTooltip } from "@mui/material";
import { useEffect, useState } from "react";

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

  const [blockSize, setBlockSize] = useState(14);

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // sm breakpoint
        setBlockSize(10);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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
            totalCount: '{{count}} Transactions'
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
          blockSize={blockSize}
          blockMargin={2}
          fontSize={12}
          theme={{
            light: ["#EAEDF0", "#C6E48B", "#7BC96F", "#239A3B", "#196127"],
            dark: ["#EAEDF0", "#C6E48B", "#7BC96F", "#239A3B", "#196127"],
          }}
          maxLevel={4}
 
        />
      </CardContent>
    </Card>
  );
}
