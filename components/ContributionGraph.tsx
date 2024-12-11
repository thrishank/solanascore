import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import HeatMap from "@uiw/react-heat-map";

export default function ContributionGraph({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  const colorPalette = [
    "#EAB8F1",
    "#DDA0E5",
    "#C77DDB",
    "#A76BBE",
    "#8A3FB1",
    "#5B2E91",
  ];
  console.log(data);

  const value = [
    { date: '2016/01/11', count: 2 },
    { date: '2016/01/12', count: 20 },
    { date: '2016/01/13', count: 10 },
    ...[...Array(17)].map((_, idx) => ({
      date: `2016/02/${idx + 10}`, count: idx, content: ''
    })),
    { date: '2016/04/11', count: 2 },
    { date: '2016/05/01', count: 5 },
    { date: '2016/05/02', count: 5 },
    { date: '2016/05/04', count: 11 },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-black dark:text-white">
          Transaction Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <HeatMap
          value={data}
           weekLabels={['', 'Mon', '', 'Wed', '', 'Fri', '']}
           className="w-full"
          // style={{ color: "#0080FF" }}
          // panelColors={colorPalette}
          // startDate={
          //   new Date(new Date().toISOString().slice(0, 10).replace(/-/g, '/'))
          // }
          startDate={new Date('2024/01/01')} // Example: Ensure this aligns with your data
        />
      </CardContent>
    </Card>
  );
}
