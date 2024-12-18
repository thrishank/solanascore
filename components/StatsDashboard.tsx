import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ContributionGraph from "./ContributionGraph";
import useAddressStore from "@/state/address";
import { useEffect, useState } from "react";
import { getSignatures } from "@/lib/sign";
import { Loader2 } from "lucide-react";

export default function StatsDashboard() {
  const [data, setData] = useState<{ date: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { address } = useAddressStore();

  const computeStats = (data: { date: string; count: number }[]) => {
    if (!data.length) {
      return {
        totalTransactions: 0,
        activeDays: 0,
        longestStreak: 0,
        currentStreak: 0,
        activityPeriod: 0,
      };
    }
   const sortedData = data.slice().sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  
    const firstDate = new Date(sortedData[0]?.date || Date.now());
    const lastDate = new Date(sortedData[sortedData.length - 1]?.date || Date.now());
  
    if (isNaN(firstDate.getTime()) || isNaN(lastDate.getTime())) {
      return {
        totalTransactions: 0,
        activeDays: 0,
        longestStreak: 0,
        currentStreak: 0,
        activityPeriod: 0,
      };
    }
  
    const activityPeriod = Math.max(
      Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24)),
      0
    );
    const totalTransactions = data.reduce((sum, day) => sum + day.count, 0);
    const uniqueDays = new Set(data.map((entry) => entry.date)).size;

    let longestStreak = 0;
    let currentStreak = 0;
    let previousDate: Date | null = null;

    for (const entry of data.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )) {
      const entryDate = new Date(entry.date);
      if (
        previousDate &&
        entryDate.getTime() - previousDate.getTime() === 86400000
      ) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
      previousDate = entryDate;
    }

    return {
      totalTransactions,
      activeDays: uniqueDays,
      longestStreak,
      currentStreak,
      activityPeriod,
    };
  };

  const [stats, setStats] = useState({
    totalTransactions: 0,
    activeDays: 0,
    longestStreak: 0,
    currentStreak: 0,
    activityPeriod: 0,
  });

  useEffect(() => {
    async function fetchData() {
      if (!address || !address[0]) {
        console.error("No address provided.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await getSignatures(address[0]);
        setData(res);
        setStats(computeStats(res));
      } catch (error) {
        console.error("Failed to fetch signatures:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [address]);

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center p-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-gray-600">Loading activity...</span>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8 text-white dark:text-gray-900">
        Solana Analytics Dashboard
      </h1>
      <div className="mb-8">
        <ContributionGraph data={data} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Transactions" value={stats.totalTransactions} />
        <StatCard title="Active Days" value={`${stats.activeDays} days`} />
        <StatCard
          title="Longest Streak"
          value={`${stats.longestStreak} days`}
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
        />
        <StatCard
          title="Activity Period"
          value={`${stats.activityPeriod} days`}
        />
      </div>
      <div className="mb-8"></div>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  progress,
}: {
  title: string;
  value: string | number;
  progress?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {progress && <Progress value={progress} className="mt-2" />}
      </CardContent>
    </Card>
  );
}
