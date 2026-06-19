import type { Metadata } from "next";
import { BookOpen, Users, FileText, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse academic resources organized by courses. Find PYQs, notes, and study materials for your specific course.",
};

const courses = [
  { name: "B.Tech Computer Science", code: "CSE", resources: 3200, students: 12400, icon: "💻" },
  { name: "B.Tech Electronics", code: "ECE", resources: 1800, students: 8200, icon: "⚡" },
  { name: "B.Tech Mechanical", code: "ME", resources: 1500, students: 6800, icon: "⚙️" },
  { name: "B.Tech Civil", code: "CE", resources: 1200, students: 5400, icon: "🏗️" },
  { name: "BCA", code: "BCA", resources: 2100, students: 9500, icon: "🖥️" },
  { name: "MCA", code: "MCA", resources: 1400, students: 4200, icon: "📊" },
  { name: "B.Sc Mathematics", code: "BSc Math", resources: 900, students: 3800, icon: "📐" },
  { name: "B.Sc Physics", code: "BSc Phy", resources: 800, students: 3200, icon: "🔬" },
  { name: "B.Com", code: "BCom", resources: 1600, students: 7100, icon: "📈" },
  { name: "BA English", code: "BA Eng", resources: 700, students: 2900, icon: "📚" },
  { name: "MBA", code: "MBA", resources: 1100, students: 4800, icon: "💼" },
  { name: "M.Sc Computer Science", code: "MSc CS", resources: 600, students: 2100, icon: "🧮" },
];

export default function CoursesPage() {
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
          <AnimatedContainer variant="stagger">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <AnimatedItem key={course.code}>
                  <div className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{course.icon}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:text-indigo-500 group-hover:opacity-100" />
                    </div>
                    <h3 className="mt-4 font-semibold transition-colors group-hover:text-indigo-500">
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
                        <Users className="h-3.5 w-3.5" />
                        {course.students.toLocaleString()}
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
