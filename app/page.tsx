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
  const { setAddress } = useAddressStore();

  const { connected, publicKey, disconnect, disconnecting } = useWallet();

  useEffect(() => {
    if (connected) {
      setAddress([publicKey?.toString()!]);
      setShowDashboard(true);
    }
    if(disconnecting){
      setShowDashboard(false);
    }

  }, [connected, disconnecting]);

  return (
    <div className="min-h-screen">
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4">
        <div className="flex h-14 items-center px-8 pt-16 max-w-screen-xl mx-auto">
          <div className="flex flex-1">
            <a
              href="/"
              className="font-semibold"
              onClick={async () => {
                setShowDashboard(!showDashboard);
                setAddress([]);
                if(connected) await disconnect();
              }}
            >
              SOLANASCORE.XYZ
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <WalletMultiButton>
                {connected ? null : (
                  <div className="transition-all duration-300 rounded-xl">
                    Connect Wallet
                  </div>
                )}
              </WalletMultiButton>
            </div>
          </div>
        </div>
      </nav>

      {showDashboard ? <Stats /> : <Hero />}
      {/* <Stats /> */}
    </div>
  );
}
