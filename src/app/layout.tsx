"use client";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "~/components/Navbar";

// Web3
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ThirdwebProvider } from "@thirdweb-dev/react/solana";
import { Network } from "@thirdweb-dev/sdk/solana";
import { WalletProvider } from "@solana/wallet-adapter-react";
import {
  BackpackWalletAdapter,
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

const network: Network = "mainnet-beta";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new BackpackWalletAdapter({ network })],
    [network]
  );

  return (
    <ThirdwebProvider network={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <html lang='es'>
            <body className={inter.className}>
              <Toaster
                toastOptions={{
                  style: {
                    background: "#1c1c1c",
                    color: "#fff",
                  },
                }}
              />
              <Navbar />
              {children}
            </body>
          </html>
        </WalletModalProvider>
      </WalletProvider>
    </ThirdwebProvider>
  );
}
