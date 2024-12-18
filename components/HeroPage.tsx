import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAddressStore from "@/state/address";
import useDashboardStore from "@/state/page";
import { PublicKey } from "@solana/web3.js";

export default function HeroPage() {
  const [showManualInput, setShowManualInput] = useState(false);
  const { address, setAddress } = useAddressStore();
  const { setShowDashboard } = useDashboardStore();

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...address];
    newAddresses[index] = value;
    setAddress(newAddresses);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredAddresses = address.filter(
      (address) => address.trim() !== ""
    );
    const validAddresses: string[] = [];

    setAddress(validAddresses);
    setShowDashboard(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-16 text-center"
    >
      <p className="text-xl md:text-2xl mb-6 text-purple-300 dark:text-purple-700">
        Uncover your Solana journey in a whole new light
      </p>
      <p className="text-lg md:text-xl mb-12 text-teal-300 dark:text-teal-700">
        Dive into your on-chain activity and discover fascinating insights
      </p>
      <div className="space-y-8">
        <div className="inline-block w-auto">
          <div
            onClick={() => setShowManualInput(!showManualInput)}
            className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-200 dark:hover:bg-teal-300 dark:text-teal-900 py-3 rounded-full text-lg transition-all duration-300 cursor-pointer px-6 inline-block"
          >
            Enter Manually
          </div>
        </div>
        {showManualInput && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleManualSubmit}
            className="space-y-4 max-w-md mx-auto"
          >
            <div>
              <div className="relative">
                <Input
                  id="address1"
                  type="text"
                  placeholder="Enter Solana wallet address"
                  value={address[0] || ""}
                  onChange={(e) => handleAddressChange(0, e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-transparent 
                    bg-white/10 backdrop-blur-sm 
                    text-white 
                    placeholder-white/50 
                    focus:border-teal-500 
                    focus:ring-2 focus:ring-teal-500/50 
                    transition-all duration-300 
                    outline-none"
                />
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none 
                  border-2 border-white/20 
                  dark:border-white/10 
                  opacity-50 
                  group-focus-within:opacity-100 
                  transition-all duration-300"
                ></div>
              </div>
            </div>
            <div>
              <div className="relative">
                <Input
                  id="address2"
                  type="text"
                  placeholder="Enter Solana Name Service"
                  value={address[1] || ""}
                  onChange={(e) => handleAddressChange(1, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-transparent 
                    bg-white/10 backdrop-blur-sm 
                    text-white 
                    placeholder-white/50 
                    focus:border-teal-500 
                    focus:ring-2 focus:ring-teal-500/50 
                    transition-all duration-300 
                    outline-none"
                />
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none 
                  border-2 border-white/20 
                  dark:border-white/10 
                  opacity-50 
                  group-focus-within:opacity-100 
                  transition-all duration-300"
                ></div>
              </div>
            </div>
            <div>
              <div className="relative">
                <Input
                  id="address3"
                  type="text"
                  placeholder="372....VQ9j, anatoly.sol"
                  value={address[2] || ""}
                  onChange={(e) => handleAddressChange(2, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-transparent 
                    bg-white/10 backdrop-blur-sm 
                    text-white 
                    placeholder-white/50 
                    focus:border-teal-500 
                    focus:ring-2 focus:ring-teal-500/50 
                    transition-all duration-300 
                    outline-none"
                />
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none 
                  border-2 border-white/20 
                  dark:border-white/10 
                  opacity-50 
                  group-focus-within:opacity-100 
                  transition-all duration-300"
                ></div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-200 dark:hover:bg-purple-300 dark:text-purple-900 px-8 py-3 rounded-full text-lg transition-all duration-300"
            >
              Submit
            </Button>
          </motion.form>
        )}
      </div>
    </motion.div>
  );
}
