import { Metadata } from "next";
import BetPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Place Bet",
};

interface Props {
  params: {
    id: string;
  };
}

export default function BetPage({ params }: Props) {
  return <BetPageContent tournamentId={params.id} />;
}

