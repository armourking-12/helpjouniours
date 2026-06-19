import type { Metadata } from "next";
import {
  Target,
  Heart,
  Lightbulb,
  Users,
  Shield,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${APP_NAME} — the AI-powered platform helping students share and discover academic resources.`,
};

const values = [
  {
    icon: Heart,
    title: "Student-First",
    description:
      "Everything we build is designed with students in mind. Free access, easy uploads, and no unnecessary barriers.",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description:
      "Every upload is moderated to maintain high-quality content. Duplicate detection ensures unique resources only.",
  },
  {
    icon: Sparkles,
    title: "AI Innovation",
    description:
      "We leverage Gemini AI to make uploading effortless. Just snap a photo and let AI fill in all the details.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Built by students, for students. The platform thrives on community contributions and collaboration.",
  },
  {
    icon: Lightbulb,
    title: "Open Knowledge",
    description:
      "We believe knowledge should be accessible to everyone. Our platform makes academic resources available to all.",
  },
  {
    icon: Target,
    title: "Exam Success",
    description:
      "Our mission is to help every student succeed. PYQs, notes, and study materials — all in one place.",
  },
];

const team = [
  {
    name: "HelpJuniors Team",
    role: "Founders & Developers",
    description:
      "A passionate team of student developers who built this platform to solve their own academic challenges.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="About HelpJuniors"
            description="We're on a mission to democratize academic resources for students everywhere. No more hunting for study materials — we bring them to you."
          />
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="fadeUp" className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-border/50 bg-card p-8 md:p-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                <GraduationCap className="h-3.5 w-3.5" />
                Our Story
              </div>
              <h2 className="text-2xl font-bold md:text-3xl">
                Born from a Student&apos;s Frustration
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  It started during exam season. We spent hours searching WhatsApp groups,
                  Google Drive links, and random websites for previous year question papers.
                  Half the links were broken. The other half were for different universities.
                </p>
                <p>
                  We thought: what if there was a single platform where students could
                  upload and find all their academic resources? And what if AI could make
                  the upload process so easy that anyone could contribute?
                </p>
                <p>
                  That&apos;s how <strong>HelpJuniors</strong> was born — a platform where
                  students help other students by sharing PYQs, notes, assignments, lab
                  files, and study materials, all organized and searchable.
                </p>
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border/40 bg-muted/30 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="fadeUp" className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Our Values</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The principles that guide everything we build
            </p>
          </AnimatedContainer>

          <AnimatedContainer variant="stagger" className="mt-12">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {values.map((value) => (
                <AnimatedItem key={value.title}>
                  <div className="rounded-2xl border border-border/50 bg-card p-6 transition-all hover:shadow-lg">
                    <div className="mb-4 inline-flex rounded-xl bg-indigo-500/10 p-2.5">
                      <value.icon className="h-5 w-5 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {value.description}
                    </p>
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
