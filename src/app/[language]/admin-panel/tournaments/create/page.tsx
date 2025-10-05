import { Metadata } from "next";
import CreateTournamentPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Create Tournament",
};

export default function CreateTournamentPage() {
  return <CreateTournamentPageContent />;
}
