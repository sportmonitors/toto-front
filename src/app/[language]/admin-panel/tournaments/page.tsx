import { Metadata } from "next";
import TournamentsPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Tournament Management",
};

export default function TournamentsPage() {
  return <TournamentsPageContent />;
}

