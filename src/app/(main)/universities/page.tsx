import type { Metadata } from "next";
import { Search, MapPin, FileText, Users, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";

export const metadata: Metadata = {
  title: "Universities",
  description:
    "Browse academic resources by university. Find PYQs and notes specific to your institution.",
};

const universities = [
  { name: "Delhi University", location: "New Delhi", resources: 4200, courses: 45, abbr: "DU" },
  { name: "Mumbai University", location: "Mumbai", resources: 3100, courses: 38, abbr: "MU" },
  { name: "GGSIPU", location: "New Delhi", resources: 2800, courses: 32, abbr: "IPU" },
  { name: "Amity University", location: "Noida", resources: 2200, courses: 40, abbr: "AU" },
  { name: "VIT Vellore", location: "Vellore", resources: 1900, courses: 28, abbr: "VIT" },
  { name: "BITS Pilani", location: "Pilani", resources: 1700, courses: 25, abbr: "BITS" },
  { name: "Anna University", location: "Chennai", resources: 2500, courses: 35, abbr: "AU" },
  { name: "Pune University", location: "Pune", resources: 1800, courses: 30, abbr: "PU" },
  { name: "JNU Delhi", location: "New Delhi", resources: 1200, courses: 22, abbr: "JNU" },
  { name: "Calcutta University", location: "Kolkata", resources: 1100, courses: 28, abbr: "CU" },
  { name: "Osmania University", location: "Hyderabad", resources: 950, courses: 26, abbr: "OU" },
  { name: "BHU Varanasi", location: "Varanasi", resources: 1400, courses: 30, abbr: "BHU" },
];

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

export default function UniversitiesPage() {
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
          <AnimatedContainer variant="stagger">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {universities.map((uni, index) => (
                <AnimatedItem key={uni.name}>
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
                </AnimatedItem>
              ))}
            </div>
          </AnimatedContainer>
        </div>
      </section>
    </>
  );
}
