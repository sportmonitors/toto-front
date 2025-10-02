import { Metadata } from "next";
import WalletPageContent from "./page-content";

export const metadata: Metadata = {
  title: "My Wallet",
};

export default function WalletPage() {
  return <WalletPageContent />;
}

