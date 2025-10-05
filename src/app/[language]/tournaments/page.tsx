import { Metadata } from "next";
import TournamentsPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Tournaments",
};

export default function TournamentsPage() {
  return <TournamentsPageContent />;
}
