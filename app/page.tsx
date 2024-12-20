"use client";

import useDashboardStore from "@/state/page";
import useAddressStore from "@/state/address";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Hero from "@/components/HeroPage";
import Stats from "@/components/Stats";
import { convertToImage } from "@/components/twitter";

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
    }
  }, [connected, disconnecting]);

  async function shareOnTwitter() {
    const base64 = await convertToImage();

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64, address: address[0] }),
    });

    const data = await res.json();
    const screenshotUrl = data.url;

    const tweetIntentUrl = `https://twitter.com/intent/tweet?text=Check out my stats!&url=${encodeURIComponent(
      screenshotUrl
    )}`;

    window.open(tweetIntentUrl, "_blank");
  }


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
                setShowDashboard(!showDashboard);
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

      <div className="text-center mt-6">
        <button
          onClick={shareOnTwitter}
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600"
        >
          Share on Twitter
        </button>
      </div>
    </div>
  );
}
