import type { Metadata } from "next";
import { Trophy, Medal, Upload, Download, Crown, Star, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "See the top contributors on HelpJuniors. Earn reputation by uploading quality academic resources.",
};

const leaderboardData = [
  { rank: 1, name: "Aarav Mehta", university: "IIT Delhi", uploads: 234, reputation: 4820, avatar: "AM" },
  { rank: 2, name: "Sneha Reddy", university: "BITS Pilani", uploads: 198, reputation: 4150, avatar: "SR" },
  { rank: 3, name: "Karthik Iyer", university: "VIT Vellore", uploads: 187, reputation: 3890, avatar: "KI" },
  { rank: 4, name: "Priya Gupta", university: "Delhi University", uploads: 156, reputation: 3420, avatar: "PG" },
  { rank: 5, name: "Rohan Sharma", university: "Mumbai University", uploads: 143, reputation: 3100, avatar: "RS" },
  { rank: 6, name: "Ananya Das", university: "JNU Delhi", uploads: 128, reputation: 2780, avatar: "AD" },
  { rank: 7, name: "Vikram Singh", university: "GGSIPU", uploads: 119, reputation: 2540, avatar: "VS" },
  { rank: 8, name: "Meera Nair", university: "Anna University", uploads: 105, reputation: 2310, avatar: "MN" },
  { rank: 9, name: "Arjun Patel", university: "Pune University", uploads: 98, reputation: 2080, avatar: "AP" },
  { rank: 10, name: "Divya Joshi", university: "Amity University", uploads: 92, reputation: 1940, avatar: "DJ" },
];

const rankGradients: Record<number, string> = {
  1: "from-amber-400 to-yellow-500",
  2: "from-slate-300 to-gray-400",
  3: "from-amber-600 to-orange-600",
};

const rankIcons: Record<number, typeof Crown> = {
  1: Crown,
  2: Medal,
  3: Medal,
};

export default function LeaderboardPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-transparent blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Leaderboard"
            description="Our top contributors who make HelpJuniors amazing. Upload quality resources to climb the ranks."
          />
        </div>
      </section>

      {/* Top 3 Cards */}
      <section className="pb-8 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="stagger">
            <div className="grid gap-4 md:grid-cols-3">
              {leaderboardData.slice(0, 3).map((user) => {
                const RankIcon = rankIcons[user.rank] || Trophy;
                return (
                  <AnimatedItem key={user.rank}>
                    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-center transition-all hover:shadow-lg">
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${rankGradients[user.rank]}`} />
                      <RankIcon className={`mx-auto h-8 w-8 ${user.rank === 1 ? "text-amber-400" : user.rank === 2 ? "text-slate-400" : "text-amber-600"}`} />
                      <div className={`mx-auto mt-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${rankGradients[user.rank]} text-xl font-bold text-white shadow-lg`}>
                        {user.avatar}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.university}</p>
                      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Upload className="h-3.5 w-3.5" />
                          {user.uploads}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-indigo-500">
                          <Star className="h-3.5 w-3.5" />
                          {user.reputation.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </AnimatedItem>
                );
              })}
            </div>
          </AnimatedContainer>
        </div>
      </section>

      {/* Full List */}
      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="stagger">
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
              {leaderboardData.slice(3).map((user) => (
                <AnimatedItem key={user.rank}>
                  <div className="flex items-center gap-4 border-b border-border/30 px-6 py-4 transition-colors last:border-b-0 hover:bg-muted/50">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                      {user.rank}
                    </span>
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                      {user.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.university}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="hidden items-center gap-1 text-muted-foreground sm:flex">
                        <Upload className="h-3.5 w-3.5" />
                        {user.uploads}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-indigo-500">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {user.reputation.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedContainer>
        </div>
      </section>
    </>
  );
}
