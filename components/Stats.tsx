import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import TxGraph from "./TxGraph";
import useAddressStore from "@/state/address";
import { useEffect, useState } from "react";
import { getSignatures } from "@/lib/sign";
import { ArrowUpRight, Award, Calendar, Loader2, Zap } from "lucide-react";
import { mock_data } from "@/thris";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function Stats() {
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
    const sortedData = data
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const firstDate = new Date(sortedData[0]?.date || Date.now());
    const lastDate = new Date(
      sortedData[sortedData.length - 1]?.date || Date.now()
    );

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
      Math.ceil(
        (lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24)
      ),
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 min-h-screen"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-indigo-900 dark:text-indigo-100">
          Solana Analytics Dashboard
        </h1>
        <div className="inline-block bg-indigo-600 text-white text-5xl font-bold py-4 px-8 rounded-full shadow-lg">
          Score: {mock_data.score ?? "N/A"} / 100
        </div>
      </div>
      {/* <div className="mb-8"> */}
      <TxGraph data={mock_data.stats.dayCount} />
      {/* </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Total Transactions"
          value={mock_data.totaltx ?? 0}
          icon={<Zap className="h-6 w-6 text-yellow-500" />}
          color="bg-gradient-to-br from-yellow-400 to-orange-500"
        />
        <StatCard
          title="Active Days"
          value={`${mock_data.stats?.uniqueDays ?? 0} days`}
          icon={<Calendar className="h-6 w-6 text-green-500" />}
          color="bg-gradient-to-br from-green-400 to-emerald-500"
        />
        <StatCard
          title="Longest Streak"
          value={`${mock_data.stats?.longestStreak ?? 0} days`}
          icon={<Award className="h-6 w-6 text-purple-500" />}
          color="bg-gradient-to-br from-purple-400 to-pink-500"
        />
        <StatCard
          title="Current Streak"
          value={`${mock_data.stats?.currentStreak ?? 0} days`}
          icon={<ArrowUpRight className="h-6 w-6 text-blue-500" />}
          color="bg-gradient-to-br from-blue-400 to-indigo-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-2">
              {mock_data.stats?.longestStreak ?? 0} days
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              From{" "}
              {new Date(
                mock_data.stats?.longestStreakDates?.start ?? Date.now()
              ).toLocaleDateString()}{" "}
              to{" "}
              {new Date(
                mock_data.stats?.longestStreakDates?.end ?? Date.now()
              ).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
              Total Fee Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {((mock_data.fee ?? 0) / LAMPORTS_PER_SOL).toFixed(3)} SOL
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className={`overflow-hidden shadow-xl ${color}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {icon}
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}
