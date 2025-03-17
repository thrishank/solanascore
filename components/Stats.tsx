import { useEffect, useRef, useState } from "react";
import TxGraph from "./TxGraph";
import { Avatar } from "./ui/avatar";
import { User } from "lucide-react";
import useAddressStore from "@/state/address";
import { ResponseData } from "@/app/api/route";
import { stats_data } from "@/lib/data";
import { Card, CardContent } from "./ui/card";
import { formatDate } from "@/lib/fn";
import StatsLoader from "./Loader";

export default function Stats() {
  const [data, setData] = useState<ResponseData>();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [queuestatus, setQueueStatus] = useState(false);
  const [queueinfo, setQueueInfo] = useState({
    length: 0,
    position: 0,
    message: "",
  });
  const [length, setLength] = useState(0);
  const prevLength = useRef(0);

  const { address } = useAddressStore();

  async function fetchData() {
    try {
      const res = await fetch(`/api?address=${address}`);
      const responseData = await res.json();

      if (res.status === 202 || res.status === 203) {
        setQueueStatus(true);
        setQueueInfo({
          length: responseData.length,
          position: responseData.position,
          message: responseData.message,
        });
        if (prevLength.current !== responseData.signatures) {
          setLength(responseData.signatures);
          prevLength.current = length;
        }
        // handle the lenght for another response also keep it 0
        return;
      }

      if (res.status === 400 || res.status === 500) {
        setErr(responseData.err);
        setQueueStatus(false);
        return;
      }

      if (res.ok && responseData.score !== undefined) {
        setData(responseData);
        setQueueStatus(false);
        setErr(null);
      } else {
        setErr("Invalid response format");
        setQueueStatus(false);
      }
    } catch (error) {
      setErr("Error fetching data. Please try again later.");
      console.error("Error fetching data:", error);
      setQueueStatus(false);
    } finally {
      if (!queuestatus) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (queuestatus) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [queuestatus, length]);

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

  if (loading || queuestatus) {
    return (
      <StatsLoader
        queuestatus={queuestatus}
        queueinfo={queueinfo}
        totalSignatures={length}
      />
    );
  }
  /*
  if (loading || queuestatus) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        {queuestatus ? (
          <>
            <p className="text-lg font-medium">{queueinfo.message}</p>
            <div className="loader animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
            {queueinfo.position > 10 ? (
              <p className="text-lg font-medium">
                There is a huge traffic ahead of you. Please come back later
                while we fetch your transactions.
              </p>
            ) : queueinfo.position > 1 ? (
              <p className="text-lg font-medium">
                Your request is being processed. Please wait a moment. You are
                curretly at {queueinfo.position} position in a queue of{" "}
                {queueinfo.length}
              </p>
            ) : (
              <>
                <p className="mt-4 text-lg font-medium animate-pulse">
                  Fetching data...
                </p>
              </>
            )}
          </>
        ) : (
          <>
            <div className="loader animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
            <p className="mt-4 text-lg font-medium animate-pulse">
              loading data...
            </p>
          </>
        )}
      </div>
    );
  }
*/
  if (err) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg font-medium text-red-500">{err}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container max-w-screen-xl mx-auto px-4 py-6 sm:py-8 md:py-12">
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex flex-col items-center" id="stats-container">
          <div className="flex flex-col items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-100 flex items-center justify-center">
                <User className="h-6 w-6 sm:h-7 sm:w-7 text-gray-500" />
              </Avatar>
              <div className="text-sm sm:text-base">
                <span
                  className="font-medium cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(address[0]);
                  }}
                >
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
          {stats_data(data!).map((item, index) => (
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
                  {item.label === "most tx" && item.startDate && (
                    <p className="text-xs text-gray-500">
                      {formatDate(item.startDate)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* <div className="text-center mt-6">
        <button
          onClick={async () => await shareOnTwitter(address[0])}
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600"
        >
          Share on Twitter
        </button>
      </div> */}

      <footer className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-20">
        <div className="text-center text-sm sm:text-base">
          <p>
            Made by{" "}
            <a
              href="https://twitter.com/3thris"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold"
            >
              @3thris
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
