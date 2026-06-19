import type { Metadata } from "next";
import { LeaderboardClient } from "./LeaderboardClient";

export const metadata: Metadata = {
  title: "Leaderboard | HelpJuniors",
  description:
    "See the top contributors on HelpJuniors. Earn reputation by uploading quality academic resources.",
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
