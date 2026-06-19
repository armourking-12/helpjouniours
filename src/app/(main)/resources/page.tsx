import type { Metadata } from "next";
import { Search, Filter, FileText, Download, BookOpen, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";
import { RESOURCE_TYPES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Browse and download previous year question papers, notes, assignments, lab files, and study materials from universities across India.",
};

const sampleResources = [
  {
    id: "1",
    title: "Data Structures & Algorithms — End Term 2024",
    type: "PYQ",
    university: "Delhi University",
    subject: "Data Structures",
    semester: 3,
    year: 2024,
    downloads: 1240,
  },
  {
    id: "2",
    title: "Operating Systems Complete Notes",
    type: "Notes",
    university: "Mumbai University",
    subject: "Operating Systems",
    semester: 4,
    year: 2024,
    downloads: 890,
  },
  {
    id: "3",
    title: "DBMS Lab File — All Experiments",
    type: "Lab File",
    university: "GGSIPU",
    subject: "Database Management",
    semester: 4,
    year: 2024,
    downloads: 670,
  },
  {
    id: "4",
    title: "Computer Networks Mid-Term Paper",
    type: "PYQ",
    university: "Amity University",
    subject: "Computer Networks",
    semester: 5,
    year: 2024,
    downloads: 520,
  },
  {
    id: "5",
    title: "Machine Learning Assignment Solutions",
    type: "Assignment",
    university: "VIT Vellore",
    subject: "Machine Learning",
    semester: 6,
    year: 2024,
    downloads: 1100,
  },
  {
    id: "6",
    title: "Software Engineering Complete Notes",
    type: "Notes",
    university: "BITS Pilani",
    subject: "Software Engineering",
    semester: 5,
    year: 2024,
    downloads: 780,
  },
];

const typeColors: Record<string, string> = {
  PYQ: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Notes: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Assignment: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Lab File": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Practical File": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "Study Material": "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

export default function ResourcesPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-1/4 top-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-violet-500/10 via-indigo-500/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Resources"
            description="Discover thousands of academic resources shared by students across India. PYQs, notes, assignments, and more."
          >
            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by subject, university, or keyword..."
                  className="w-full rounded-xl border border-border bg-card py-3.5 pl-12 pr-4 text-base shadow-sm transition-all placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </PageHeader>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filter Chips */}
          <AnimatedContainer variant="fadeUp">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" />
                Filter:
              </span>
              {RESOURCE_TYPES.map((type) => (
                <button
                  key={type}
                  className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {type}
                </button>
              ))}
            </div>
          </AnimatedContainer>

          {/* Resource Cards */}
          <AnimatedContainer variant="stagger" className="mt-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sampleResources.map((resource) => (
                <AnimatedItem key={resource.id}>
                  <div className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${typeColors[resource.type] || "bg-muted text-muted-foreground"}`}
                      >
                        {resource.type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Download className="h-3 w-3" />
                        {resource.downloads.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="mt-3 font-semibold leading-snug transition-colors group-hover:text-indigo-500">
                      {resource.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        {resource.university}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Sem {resource.semester}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {resource.year}
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
