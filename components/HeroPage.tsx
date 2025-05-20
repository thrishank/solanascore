import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAddressStore from "@/state/address";
import useDashboardStore from "@/state/page";
import { PublicKey } from "@solana/web3.js";
import { getWallet } from "@/lib/domain";
import { toast } from "@/hooks/use-toast";

export default function Hero() {
  const [showInput, setShowInput] = useState(false);
  const { address, setAddress } = useAddressStore();
  const { setShowDashboard } = useDashboardStore();

  const handleOnSubmit = async () => {
    const addresses = address.map((addr) => addr.trim()).filter((addr) => addr);
    if (addresses.length === 0) {
      toast({
        title: "Address Required",
        duration: 4000,
        description: "Please enter at least one wallet address.",
        className: "bg-red-500",
      });
      return;
    }

    for (const addr of addresses) {
      try {
        if (addr.includes(".sol")) {
          try {
            const wallet = await getWallet(addr);
            if (wallet) {
              setAddress([wallet]);
              setShowDashboard(true);
              return;
            } else {
              toast({
                title: "Domain Not Found",
                duration: 4000,
                description: `The domain ${addr} does not exist.`,
                className: "bg-red-500",
              });
              return;
            }
          } catch (error) {
            toast({
              title: "Domain Not Found",
              duration: 4000,
              description: `The domain ${addr} does not exist.`,
              className: "bg-red-500",
            });
            return;
          }
        }

        new PublicKey(addr);
        // handle duplicates
        setShowDashboard(true);
        setAddress(addresses); // Store all addresses
      } catch (error) {
        console.error(error);
        toast({
          title: "Invalid Solana Address",
          duration: 4000,
          description: `Please enter a valid Solana address: ${addr}.`,
          className: "bg-red-500",
        });
      }
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const newAddresses = [...address];
    newAddresses[index] = value;
    setAddress(newAddresses);
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
              onClick={() => setShowInput(!showInput)}
            >
              enter manually
            </button>{" "}
            to assess onchain-nativeness
          </p>
        </div>

        {showInput && (
          <div className="space-y-4 max-w-md mx-auto">
            {Array.from({ length: 3 }).map((_, index) => (
              <Input
                key={index}
                placeholder={index === 0 ? "toly.sol" : "372a......vq9j"}
                className="h-12 text-base sm:text-lg"
                value={address[index] || ""}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleOnSubmit();
                  }
                }}
                aria-label={`Enter wallet address ${index + 1}`}
              />
            ))}
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
