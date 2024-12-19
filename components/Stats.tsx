import { useEffect, useState } from "react";
import TxGraph from "./TxGraph";
import { Avatar } from "./ui/avatar";
import { User } from "lucide-react";
import useAddressStore from "@/state/address";
import { ResponseData } from "@/app/api/route";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ProgramIdDetailedCount } from "@/lib/program";
import { popular_program_id } from "@/lib/data";

export default function Stats() {
  const [data, setData] = useState<ResponseData>();
  const { address } = useAddressStore();

  const [loading, setLoading] = useState(true);

 

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api?address=${address[0]}`);
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await res.json();
        setData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const [fetchedTransactions, setFetchedTransactions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (loading) {
      interval = setInterval(() => {
        setFetchedTransactions((prev) => {
          const next = prev + 10;
          return next;
        });
      }, 2000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loading, fetchedTransactions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="loader animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-lg font-medium animate-pulse">
          Fetching transactions...
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Fetched {fetchedTransactions} transactions
        </p>
      </div>
    );
  }
  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "N/A";

    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  };

  return (
    <main className="container max-w-screen-xl mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <Avatar className="h-8 w-8 bg-gray-100 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </Avatar>
            <div className="text-sm">
              <span className="font-medium">
                {address[0].slice(0, 4) +
                  "......." +
                  address[0].slice(address.length - 5)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-xl font-medium">ONCHAIN SCORE:</h2>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-6xl font-normal text-[#4F46E5]">
              {data?.score}
            </span>
            <span className="text-2xl text-gray-600">/100</span>
          </div>
        </div>

        <TxGraph data={data?.stats?.dayCount || []} />
        
        <div className="grid grid-cols-2 gap-8 items-start justify-items-start">
          {[
            {
              emoji: "💫",
              label: "transactions",
              text: "Transactions: ",
              value: data?.totaltx,
              suffix: " on Solana",
            },
            {
              emoji: "💸",
              label: "days",
              text: "Total Fee Paid ",
              value: (data?.fee! / LAMPORTS_PER_SOL).toFixed(3),
              suffix: " SOL",
            },
            {
              emoji: "👤",
              label: "active",
              text: "Active for ",
              value: data?.stats?.uniqueDays,
              suffix: " unique days",
            },
            {
              emoji: "🔥",
              label: "streak",
              text: "Longest streak: ",
              value: data?.stats?.longestStreak,
              suffix: " days",
              startDate: new Date(data?.stats?.longestStreakDates?.start || ""),
              endDate: new Date(data?.stats?.longestStreakDates?.end || ""),
            },
            {
              emoji: "🎯",
              label: "current",
              text: "Current streak: ",
              value: data?.stats?.currentStreak || "0",
              suffix: " days",
              startDate: new Date(data?.stats?.currentStreakDates?.start || ""),
              endDate: new Date(data?.stats?.currentStreakDates?.end || ""),
            },
            {
              emoji: "🪙",
              label: "transfer",
              text: "Token Trasfers  ",
              value:
                getProgramCount(
                  data?.programIdCountMap!,
                  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                ) +
                getProgramCount(
                  data?.programIdCountMap!,
                  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
                ),
              suffix: " ",
            },
            {
              emoji: "🔄",
              label: "swap",
              text: "Token Swaps  ",
              value:
                getProgramCount(
                  data?.programIdCountMap!,
                  popular_program_id["jupiter"][0]
                ) +
                getProgramCount(
                  data?.programIdCountMap!,
                  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
                ),
              suffix: " ",
            },
            {
              emoji: "🌁",
              label: "bridge",
              text: "Token Bridge ",
              value: getProgramCount(
                data?.programIdCountMap!,
                "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb"
              ),
              suffix: " ",
            },
            // {
            //   emoji: "🔄",
            //   label: "swaps",
            //   text: "Jupiter Interactions  ",
            //   value:
            //     getProgramCount(
            //       data?.programIdCountMap!,
            //       popular_program_id["jupiter"][0]
            //     ) +
            //     getProgramCount(
            //       data?.programIdCountMap!,
            //       popular_program_id["jupiter"][1]
            //     ) +
            //     getProgramCount(
            //       data?.programIdCountMap!,
            //       popular_program_id["jupiter"][2]
            //     ),
            //   suffix: " ",
            // },
            // {
            //   emoji: "🔄",
            //   label: "squads",
            //   text: "Tensor Interactions ",
            //   value:
            //     getProgramCount(
            //       data?.programIdCountMap!,
            //       popular_program_id["tensor"][0]
            //     ) +
            //     getProgramCount(
            //       data?.programIdCountMap!,
            //       popular_program_id["tensor"][1]
            //     ),
            //   suffix: " ",
            // },
            // {
            //   emoji: "🔄",
            //   label: "Squads",
            //   text: "Squads Interactions ",
            //   value:
            //     getProgramCount(
            //       data?.programIdCountMap!,
            //       popular_program_id["squads"][0]
            //     ) +
            //     getProgramCount(
            //       data?.programIdCountMap!,
            //       popular_program_id["squads"][1]
            //     ),
            //   suffix: " ",
            // },
            // {
            //   emoji: "🌉",
            //   label: "bridge",
            //   text: "Bridge transactions: ",
            //   value: data?.stats?.bridgeTransactions || "0",
            //   suffix: "",
            // },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 pl-12">
              <span
                role="img"
                aria-label={item.label}
                className="w-6 text-center"
              >
                {item.emoji}
              </span>
              <span className="flex-1">
                {item.text}
                <strong className="font-semibold">{item.value}</strong>
                {item.suffix}
                {(item.label === "streak" || item.label === "current") &&
                  item.startDate &&
                  item.endDate &&
                  item.startDate <= item.endDate && (
                    <span className="block text-xs text-gray-500">
                      {formatDate(item.startDate)} -{" "}
                      {new Date(item.endDate).toISOString().split("T")[0] ===
                      new Date().toISOString().split("T")[0]
                        ? "Present"
                        : formatDate(item.endDate)}
                    </span>
                  )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function getProgramCount(
  data: ProgramIdDetailedCount[],
  targetProgramId: string
): number {
  const program = data.find((item) => item.programId === targetProgramId);
  return program?.overallCount ?? 0;
}
