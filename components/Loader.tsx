import React, { useState, useEffect } from "react";

interface QueueInfo {
  length: number;
  position: number;
  message: string;
}

interface LoaderProps {
  queuestatus: boolean;
  queueinfo: QueueInfo;
  totalSignatures: number;
}

const StatsLoader: React.FC<LoaderProps> = ({
  queuestatus,
  queueinfo,
  totalSignatures,
}) => {
  const [processedCount, setProcessedCount] = useState(0);

  useEffect(() => {
    if (totalSignatures > 0) {
      setProcessedCount(0);
    }
  }, [totalSignatures]);

  useEffect(() => {
    if (totalSignatures > 0) {
      let processed = 0;
      const updateInterval = setInterval(() => {
        if (processed >= totalSignatures) {
          clearInterval(updateInterval);
          return;
        }
        processed += Math.min(1, totalSignatures - processed);
        setProcessedCount((prev) => prev + 1);
      }, 100);

      return () => clearInterval(updateInterval);
    }
  }, [totalSignatures]);

  const renderProgress = () => {
    //  if (!totalSignatures) return null;
    const progress = (processedCount / totalSignatures) * 100;

    return (
      <div className="w-full max-w-md space-y-2">
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
            />
          </div>
          <div className="text-sm text-gray-600 text-center">
            <p>
              Processing {processedCount} of {totalSignatures} transactions
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      {queuestatus ? (
        <>
          <p className="text-lg font-medium">{queueinfo.message}</p>
          <div className="loader animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500" />
          <p className="text-lg font-medium max-w-md text-center">
            {queueinfo.position > 10 ? (
              "There is a huge traffic ahead of you. Please come back later while we fetch your transactions."
            ) : queueinfo.position > 2 ? (
              `Your request is being processed. Please wait a moment. You are currently at ${queueinfo.position} position in a queue of ${queueinfo.length}`
            ) : queueinfo.position === 1 ? (
              <>
                Your request is being processed. Progress below:
                {renderProgress()}
              </>
            ) : (
              "Fetching data..."
            )}
          </p>
        </>
      ) : (
        <>
          <div className="loader animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500" />
          <p className="text-lg font-medium animate-pulse">Loading data...</p>
          {renderProgress()}
        </>
      )}
    </div>
  );
};

export default StatsLoader;
