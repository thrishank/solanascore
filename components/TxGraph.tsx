import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Tooltip from "@uiw/react-tooltip";
import HeatMap from "@uiw/react-heat-map";

export default function TxGraph({
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

  return (
    // <Card className="w-full max-w-4xl mx-auto">
    //   <CardHeader>
    //     <CardTitle className="text-xl font-semibold text-black dark:text-white">
    //       Transaction Activity
    //     </CardTitle>
    //   </CardHeader>
    //   <CardContent>
    <div className="ml-20">

    <HeatMap
      value={data}
      weekLabels={["", "Mon", "", "Wed", "", "Fri", ""]}
      className="w-full"
      // style={{ color: "#0080FF" }}
      // panelColors={colorPalette}
      // startDate={
        //   new Date(new Date().toISOString().slice(0, 10).replace(/-/g, '/'))
        // }
        startDate={new Date("2023/12/19")} // Example: Ensure this aligns with your data
        endDate={new Date("2024/12/19")}
        rectRender={(props, data) => {
          // if (!data.count) return <rect {...props} />;
          return (
            <Tooltip placement="bottom" content={`count: ${data.count || 0}`}>
            <rect {...props} />
          </Tooltip>
        );
        // error showing two times at the top-right
      }}
      />
      </div>
    //   </CardContent>
    // </Card>
  );
}
