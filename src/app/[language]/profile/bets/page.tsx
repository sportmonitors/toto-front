import { Metadata } from "next";
import BetsPageContent from "./page-content";

export const metadata: Metadata = {
  title: "My Bets",
};

export default function BetsPage() {
  return <BetsPageContent />;
}
