import { useEffect, useState } from "react";
import TxGraph from "./TxGraph";
import { Avatar } from "./ui/avatar";
import { User } from "lucide-react";
import useAddressStore from "@/state/address";
import { ResponseData } from "@/app/api/route";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ProgramIdDetailedCount } from "@/lib/program";
import { popular_program_id } from "@/lib/data";
import { convertToImage } from "./twitter";
import { Card, CardContent } from "./ui/card";

export default function Stats() {
  const [data, setData] = useState<ResponseData>();
  const [err, setErr] = useState<string | null>(null);
  const { address } = useAddressStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api?address=${address[0]}`);
        const data = await res.json();
        if (data.err) {
          setErr(data.err);
          return;
        }

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

  const [small, setSmall] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // sm breakpoint
        setSmall(true);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
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

  if (err) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg font-medium text-red-500">{err}</p>
        </div>
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
    <main
      className="container max-w-screen-xl mx-auto px-4 py-6 sm:py-8 md:py-12"
      id="stats-container"
    >
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-100 flex items-center justify-center">
                <User className="h-6 w-6 sm:h-7 sm:w-7 text-gray-500" />
              </Avatar>
              <div className="text-sm sm:text-base">
                <span className="font-medium">
                  {address[0].slice(0, 4) +
                    "......." +
                    address[0].slice(address.length - 5)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-center pb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-medium">
              ONCHAIN SCORE:
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl md:text-6xl font-normal text-[#4F46E5]">
                {data?.score}
              </span>
              <span className="text-xl sm:text-2xl text-gray-600">/100</span>
            </div>
          </div>

          {small ? (
            <TxGraph data={data?.stats?.dayCount || []} />
          ) : (
            <div id="tx-graph-container" className="pb-4">
              <TxGraph data={data?.stats?.dayCount || []} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
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
              text: "Token Transfers  ",
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
              text: "Token Bridges ",
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
            <Card key={index}>
              <CardContent className="flex items-start gap-3 p-4">
                <span role="img" aria-label={item.label} className="text-2xl">
                  {item.emoji}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{item.text}</p>
                  <p className="text-lg font-semibold">
                    {item.value !== undefined ? item.value : "N/A"}
                    {item.suffix && (
                      <span className="text-sm font-normal">{item.suffix}</span>
                    )}
                  </p>
                  {(item.label === "streak" || item.label === "current") &&
                    item.startDate &&
                    item.endDate &&
                    item.startDate <= item.endDate && (
                      <p className="text-xs text-gray-500">
                        {formatDate(item.startDate)} -{" "}
                        {item.endDate.toISOString().split("T")[0] ===
                        new Date().toISOString().split("T")[0]
                          ? "Present"
                          : formatDate(item.endDate)}
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
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
