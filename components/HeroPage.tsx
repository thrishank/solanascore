import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAddressStore from "@/state/address";
import useDashboardStore from "@/state/page";
import { PublicKey } from "@solana/web3.js";

export default function Hero() {
  const [showinput, setShowinput] = useState(false);
  const { address, setAddress } = useAddressStore();
  const {  setShowDashboard } = useDashboardStore();

  return (
    <main className="container max-w-screen-xl mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-8xl font-normal text-center">Are you onchain?</h1>

        <div className="text-center space-y-1">
          <p className="text-xl text-[#4F46E5]">
            Connect your wallet or{" "}
            <a
              href="#"
              className="font-bold underline"
              onClick={() => setShowinput(!showinput)}
            >
              enter manually
            </a>{" "}
            to assess onchain-nativeness
          </p>
        </div>

        {showinput && (
          <div className="space-y-4 max-w-md mx-auto">
            <Input
              placeholder="372a......vq9j"
              className="h-12 text-lg"
              onChange={(e) => setAddress([e.target.value])}
            />
            <Button
              className="w-full h-12 text-lg bg-[#4F46E5] hover:bg-[#4F46E5]"
              onClick={() => {
                try {
                  const pubkey = new PublicKey(address[0].trim());
                  setShowDashboard(true);
                  setAddress([pubkey.toString()])
                } catch (error) {
                  console.error(error);
                  alert("Please enter a valid Solana address.");
                }
              }}
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
