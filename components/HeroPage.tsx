import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAddressStore from "@/state/address";
import useDashboardStore from "@/state/page";
import { PublicKey } from "@solana/web3.js";

export default function Hero() {
  const [showinput, setShowinput] = useState(false);
  const { address, setAddress } = useAddressStore();
  const { setShowDashboard } = useDashboardStore();

  const handleOnSubmit = () => {
    try {
      const pubkey = new PublicKey(address[0].trim());
      setShowDashboard(true);
      setAddress([pubkey.toString()]);
    } catch (error) {
      console.error(error);
      alert("Please enter a valid Solana address.");
    }
  };
  return (
    <main className="container max-w-screen-xl mx-auto px-4 py-8 sm:py-16">
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-normal text-center leading-tight">
          Are you onchain?
        </h1>

        <div className="text-center space-y-2">
          <p className="text-lg sm:text-xl text-[#4F46E5]">
            Connect your wallet or{" "}
            <button
              className="font-bold underline focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 rounded-sm"
              onClick={() => setShowinput(!showinput)}
            >
              enter manually
            </button>{" "}
            to assess onchain-nativeness
          </p>
        </div>

        {showinput && (
          <div className="space-y-4 max-w-md mx-auto">
            <Input
              placeholder="372a......vq9j"
              className="h-12 text-base sm:text-lg"
              onChange={(e) => setAddress([e.target.value])}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleOnSubmit();
                }
              }}
              aria-label="Enter wallet address"
            />
            <Button
              className="w-full h-12 text-base sm:text-lg text-white bg-[#4F46E5] hover:bg-[#4F46E5]/90 focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2"
              onClick={handleOnSubmit}
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
