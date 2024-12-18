'use client'

import { ThemeProvider } from 'next-themes'
import HeroPage from '@/components/HeroPage'
import Stats from '@/components/Stats'
import useDashboardStore from '@/state/page'
import useAddressStore from '@/state/address'
import { PublicKey } from '@solana/web3.js'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export default function SolanaAnalytics() {
  const { showDashboard, setShowDashboard } = useDashboardStore()
  const { address, setAddress } = useAddressStore();

  const home = () => {
    const pubKeys = address.map((addr) => {
      return new PublicKey(addr)
    })
    if (pubKeys.length > 0) {
      setShowDashboard(!showDashboard);
    }
  }
 
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    if(connected){
      setAddress([publicKey?.toBase58() || ''])
      setShowDashboard(true)
    }
  }, [connected])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-900 via-black to-teal-900 dark:from-white dark:via-purple-50 dark:to-teal-50 transition-all duration-500 p-4">
        <div className="w-full flex justify-between items-center mb-8 p-8">
          <h1
            className="text-xl md:text-4xl font-bold text-white dark:text-gray-900 cursor-pointer"
            onClick={home}
          >
            Solana Wrapped
          </h1>
          <WalletMultiButton>
            {connected ? null : (
              <div
                className="transition-all duration-300"
              >
                Connect Wallet
              </div>
            )}
          </WalletMultiButton>
        </div>
        <div className="w-full max-w-4xl p-4 flex justify-center">
          {/* {!showDashboard ? (
            <HeroPage />
          ) : (
            <StatsDashboard />
          )} */}
          <Stats />
        </div>
      </div>
    </ThemeProvider>
  )
}