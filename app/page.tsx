"use client";

import useDashboardStore from "@/state/page";
import useAddressStore from "@/state/address";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Hero from "@/components/HeroPage";
import Stats from "@/components/Stats";

export default function SolanaAnalytics() {
  const { showDashboard, setShowDashboard } = useDashboardStore();
  const { address, setAddress } = useAddressStore();

  const { connected, publicKey, disconnect, disconnecting } = useWallet();

  useEffect(() => {
    if (connected) {
      setAddress([publicKey?.toString()!]);
      setShowDashboard(true);
    }
    if (disconnecting) {
      setShowDashboard(false);
      setAddress([]);
    }
  }, [connected, disconnecting]);

  return (
    <div className="min-h-screen">
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row h-auto sm:h-14 items-center px-4 sm:px-8 pt-4 sm:pt-16 max-w-screen-xl mx-auto">
          <div className="flex flex-1 w-full sm:w-auto justify-center sm:justify-start mb-4 sm:mb-0">
            <a
              href="/"
              className="font-semibold text-lg sm:text-xl"
              onClick={async (e) => {
                e.preventDefault();
                setShowDashboard(false);
                setAddress([]);
                if (connected) await disconnect();
              }}
            >
              SOLANASCORE.XYZ
            </a>
          </div>
          <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto">
            <WalletMultiButton>
              {connected ? null : (
                <div className="transition-all duration-300 rounded-xl px-4 py-2 text-sm sm:text-base">
                  Connect Wallet
                </div>
              )}
            </WalletMultiButton>
          </div>
        </div>
      </nav>

      <main className="mt-4 sm:mt-8 flex justify-center">
        {showDashboard ? <Stats /> : <Hero />}
      </main>
    </div>
  );
}
