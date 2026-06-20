import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Users, FileText, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse academic resources organized by courses. Find PYQs, notes, and study materials for your specific course.",
};

const getCourseIcon = (courseName: string) => {
  const name = courseName.toLowerCase();
  if (name.includes("computer") || name.includes("cse") || name.includes("bca") || name.includes("mca")) return "💻";
  if (name.includes("electronic") || name.includes("ece") || name.includes("electrical") || name.includes("eee")) return "⚡";
  if (name.includes("mechanic") || name.includes("me")) return "⚙️";
  if (name.includes("civil") || name.includes("ce")) return "🏗️";
  if (name.includes("math")) return "📐";
  if (name.includes("physic")) return "🔬";
  if (name.includes("commerce") || name.includes("bcom") || name.includes("business") || name.includes("bba") || name.includes("mba")) return "📈";
  if (name.includes("art") || name.includes("english") || name.includes("ba")) return "📚";
  return "🎓";
};

export default async function CoursesPage() {
  await connectToDatabase();

  const aggregation = await Resource.aggregate([
    { $match: { status: "approved" } },
    { 
      $group: { 
        _id: { $toUpper: "$course" }, 
        name: { $first: "$course" },
        resources: { $sum: 1 },
        uniqueUniversities: { $addToSet: { $toUpper: "$university" } }
      } 
    },
    {
      $project: {
        _id: 0,
        name: 1,
        resources: 1,
        universities: { $size: "$uniqueUniversities" }
      }
    },
    { $sort: { resources: -1 } }
  ]);

  const courses = aggregation.map(item => ({
    name: item.name,
    code: item.name.split(' ').map((word: string) => word[0]).join('').substring(0, 4).toUpperCase(),
    resources: item.resources,
    universities: item.universities,
    icon: getCourseIcon(item.name)
  }));

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/3 top-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Courses"
            description="Browse resources organized by course. Find exactly what you need for your program."
          />
        </div>
      </section>

      <section className="pb-20 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-500 mb-4">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">No Courses Yet</h3>
              <p className="mt-2 text-muted-foreground">
                Upload resources to see courses populated here!
              </p>
            </div>
          ) : (
            <AnimatedContainer variant="stagger">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <AnimatedItem key={course.name}>
                    <Link href={`/resources?course=${encodeURIComponent(course.name)}`} className="block">
                      <div className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:shadow-lg">
                        <div className="flex items-start justify-between">
                          <span className="text-3xl">{course.icon}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:text-indigo-500 group-hover:opacity-100" />
                        </div>
                        <h3 className="mt-4 font-semibold transition-colors group-hover:text-indigo-500 line-clamp-1">
                          {course.name}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {course.code}
                        </p>
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {course.resources.toLocaleString()} resources
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {course.universities.toLocaleString()} universities
                          </span>
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
