import { Metadata } from "next";
/* import { getTranslations } from "next-intl/server"; */
import TournamentDetailPageContent from "./page-content";
/* 
export async function generateMetadata({
  params: { language },
}: {
  params: { language: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: language, namespace: "Tournament" });

  return {
    title: t("meta_title"),
  };
} */

const TournamentDetailPage = () => {
  return <TournamentDetailPageContent />;
};

export default TournamentDetailPage;
