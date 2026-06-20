import type { Metadata } from "next";
import Link from "next/link";
import { Search, MapPin, FileText, Users, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Universities",
  description:
    "Browse academic resources by university. Find PYQs and notes specific to your institution.",
};

const gradients = [
  "from-indigo-500 to-violet-500",
  "from-violet-500 to-purple-500",
  "from-blue-500 to-indigo-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-purple-500",
];

export default async function UniversitiesPage() {
  await connectToDatabase();

  const aggregation = await Resource.aggregate([
    { $match: { status: "approved" } },
    { 
      $group: { 
        _id: { $toUpper: "$university" }, 
        name: { $first: "$university" },
        resources: { $sum: 1 },
        uniqueCourses: { $addToSet: { $toUpper: "$course" } }
      } 
    },
    {
      $project: {
        _id: 0,
        name: 1,
        resources: 1,
        courses: { $size: "$uniqueCourses" }
      }
    },
    { $sort: { resources: -1 } }
  ]);

  const universities = aggregation.map(item => ({
    name: item.name,
    location: "Global",
    resources: item.resources,
    courses: item.courses,
    abbr: item.name.split(' ').map((word: string) => word[0]).join('').substring(0, 3).toUpperCase()
  }));

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-1/3 top-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Universities"
            description="Find resources specific to your university. Browse by institution to discover relevant study materials."
          >
            <div className="mx-auto max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search universities..."
                  className="w-full rounded-xl border border-border bg-card py-3 pl-12 pr-4 text-base shadow-sm transition-all placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </PageHeader>
        </div>
      </section>

      <section className="pb-20 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {universities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-indigo-500/10 p-4 text-indigo-500 mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">No Universities Yet</h3>
              <p className="mt-2 text-muted-foreground">
                Be the first to upload a resource for your university!
              </p>
            </div>
          ) : (
            <AnimatedContainer variant="stagger">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {universities.map((uni, index) => (
                  <AnimatedItem key={uni.name}>
                    <Link href={`/resources?university=${encodeURIComponent(uni.name)}`} className="block">
                      <div className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:shadow-lg">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} text-sm font-bold text-white shadow-md`}
                          >
                            {uni.abbr}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold transition-colors group-hover:text-indigo-500">
                              {uni.name}
                            </h3>
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {uni.location}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:text-indigo-500 group-hover:opacity-100" />
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {uni.resources.toLocaleString()} resources
                          </span>
                          <span>{uni.courses} courses</span>
                        </div>
                      </div>
                    </Link>
                  </AnimatedItem>
                ))}
              </div>
            </AnimatedContainer>
          )}
        </div>
      </section>
    </>
  );
}
