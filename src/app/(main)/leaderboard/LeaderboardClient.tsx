"use client";

import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Upload, Crown, Star, TrendingUp, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";

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

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

export function LeaderboardClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/users/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });

  const leaderboardData = data?.data || [];

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

      {isLoading ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      ) : leaderboardData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No data yet!</h3>
          <p className="text-sm text-muted-foreground">Be the first to upload resources and top the leaderboard.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Cards */}
          <section className="pb-8 pt-4">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <AnimatedContainer variant="stagger">
                <div className="grid gap-4 md:grid-cols-3">
                  {leaderboardData.slice(0, 3).map((user: any, index: number) => {
                    const rank = index + 1;
                    const RankIcon = rankIcons[rank] || Trophy;
                    return (
                      <AnimatedItem key={user.id}>
                        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-center transition-all hover:shadow-lg">
                          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${rankGradients[rank]}`} />
                          <RankIcon className={`mx-auto h-8 w-8 ${rank === 1 ? "text-amber-400" : rank === 2 ? "text-slate-400" : "text-amber-600"}`} />
                          <div className={`mx-auto mt-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${rankGradients[rank]} text-xl font-bold text-white shadow-lg`}>
                            {user.image ? (
                              <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                              getInitials(user.name)
                            )}
                          </div>
                          <h3 className="mt-3 text-lg font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.role}</p>
                          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Upload className="h-3.5 w-3.5" />
                              {user.totalUploads}
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
          {leaderboardData.length > 3 && (
            <section className="pb-20">
              <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <AnimatedContainer variant="stagger">
                  <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
                    {leaderboardData.slice(3).map((user: any, index: number) => {
                      const rank = index + 4;
                      return (
                        <AnimatedItem key={user.id}>
                          <div className="flex items-center gap-4 border-b border-border/30 px-6 py-4 transition-colors last:border-b-0 hover:bg-muted/50">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                              {rank}
                            </span>
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                              {user.image ? (
                                <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                              ) : (
                                getInitials(user.name)
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="hidden items-center gap-1 text-muted-foreground sm:flex">
                                <Upload className="h-3.5 w-3.5" />
                                {user.totalUploads}
                              </span>
                              <span className="flex items-center gap-1 font-medium text-indigo-500">
                                <TrendingUp className="h-3.5 w-3.5" />
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
          )}
        </>
      )}
    </>
  );
}
