"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  BookOpen,
  Upload,
  Search,
  Users,
  Sparkles,
  Download,
  Shield,
  Trophy,
  ArrowRight,
  Star,
  FileText,
  GraduationCap,
  Zap,
  Globe,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Uploads",
    description:
      "Just snap a photo of a question paper. Our AI extracts all details — university, subject, semester, and more — automatically.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Find exactly what you need with advanced filters. Search by university, course, subject, semester, or exam type.",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: Shield,
    title: "Verified Content",
    description:
      "Every upload goes through admin moderation. Duplicate detection ensures only unique, high-quality resources are shared.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Trophy,
    title: "Contributor Rewards",
    description:
      "Earn reputation points for every approved upload. Climb the leaderboard and get recognized for your contributions.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Download,
    title: "Instant Downloads",
    description:
      "Download PYQs, notes, assignments, lab files, and study materials instantly. No sign-up walls for browsing.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: Globe,
    title: "Multi-University",
    description:
      "Resources from universities across the country. Find materials specific to your institution and curriculum.",
    gradient: "from-cyan-500 to-sky-600",
  },
];



import { useState, useEffect } from "react";

export default function HomePage() {
  const [dbStats, setDbStats] = useState({
    resources: 0,
    universities: 0,
    users: 0,
    downloads: 0
  });

  useEffect(() => {
    fetch('/api/public/stats')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setDbStats({
            resources: res.data.resources,
            universities: res.data.universities,
            users: res.data.users,
            downloads: res.data.downloads
          });
        }
      })
      .catch(console.error);
  }, []);

  const dynamicStats = [
    { value: dbStats.resources.toLocaleString(), label: "Resources", icon: FileText },
    { value: dbStats.universities.toLocaleString(), label: "Universities", icon: GraduationCap },
    { value: dbStats.users.toLocaleString(), label: "Students", icon: Users },
    { value: dbStats.downloads.toLocaleString(), label: "Downloads", icon: Download },
  ];

  return (

    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "HelpJuniors",
            url: "https://helpjuniors.com",
            logo: "https://helpjuniors.com/favicon.ico",
            description: "AI-Powered Student Resources platform for finding previous year question papers, notes, and study materials.",
            sameAs: [
              "https://twitter.com/helpjuniors",
              "https://github.com/helpjuniors"
            ]
          })
        }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-purple-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 md:pt-28 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <AnimatedContainer variant="fadeDown" delay={0}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Student Resources
              </div>
            </AnimatedContainer>

            {/* Headline */}
            <AnimatedContainer variant="fadeUp" delay={0.1}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Your Academic Resources,{" "}
                <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                  Powered by AI
                </span>
              </h1>
            </AnimatedContainer>

            {/* Subheadline */}
            <AnimatedContainer variant="fadeUp" delay={0.2}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Upload, discover, and download previous year question papers, notes,
                assignments, and study materials. Let AI do the heavy lifting.
              </p>
            </AnimatedContainer>

            {/* CTA Buttons */}
            <AnimatedContainer variant="fadeUp" delay={0.3}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href={ROUTES.resources}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110"
                >
                  Browse Resources
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={ROUTES.about}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Learn More
                </Link>
              </div>
            </AnimatedContainer>
          </div>

          {/* Stats */}
          <AnimatedContainer variant="stagger" className="mt-20" delay={0.4}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
              {dynamicStats.map((stat) => (
                <AnimatedItem key={stat.label}>
                  <div className="group flex flex-col items-center rounded-2xl border border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm transition-all hover:border-indigo-500/30 hover:bg-card hover:shadow-lg">
                    <stat.icon className="mb-3 h-6 w-6 text-indigo-500" />
                    <p className="text-2xl font-bold tracking-tight md:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedContainer>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/40 bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="fadeUp" className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-indigo-500" />
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                Ace Your Exams
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete platform designed for students, by students. Every feature built
              to make your academic life easier.
            </p>
          </AnimatedContainer>

          <AnimatedContainer variant="stagger" className="mt-16">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <AnimatedItem key={feature.title}>
                  <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:shadow-lg">
                    <div
                      className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 shadow-lg`}
                    >
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                    {/* Hover gradient effect */}
                    <div
                      className={`pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 blur-3xl transition-opacity group-hover:opacity-10`}
                    />
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedContainer>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="fadeUp" className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to get started with HelpJuniors
            </p>
          </AnimatedContainer>

          <AnimatedContainer variant="stagger" className="mt-16">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: Upload,
                  title: "Upload or Snap",
                  description:
                    "Upload a document or take a photo of a question paper. Our AI handles the rest.",
                },
                {
                  step: "02",
                  icon: Sparkles,
                  title: "AI Extracts Details",
                  description:
                    "Gemini AI automatically identifies the university, subject, semester, year, and more.",
                },
                {
                  step: "03",
                  icon: BookOpen,
                  title: "Share & Discover",
                  description:
                    "Your resource goes live after moderation. Browse thousands of resources from other students.",
                },
              ].map((item) => (
                <AnimatedItem key={item.step}>
                  <div className="relative text-center">
                    <div className="mb-4 text-6xl font-black text-muted-foreground/10">
                      {item.step}
                    </div>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
                      <item.icon className="h-7 w-7 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedContainer>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="scaleIn">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-10 text-center text-white md:p-16">
              {/* Background pattern */}
              <div className="pointer-events-none absolute inset-0 opacity-10">
                <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute -bottom-10 -right-10 h-60 w-60 rounded-full bg-white/20 blur-2xl" />
              </div>
              <h2 className="relative text-3xl font-bold tracking-tight md:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-lg text-indigo-100">
                Join thousands of students already sharing and discovering academic
                resources. It&apos;s free, fast, and AI-powered.
              </p>
              <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href={ROUTES.register}
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-600 shadow-lg transition-all hover:shadow-xl hover:brightness-95"
                >
                  Create Free Account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={ROUTES.resources}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  Browse Resources
                </Link>
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </section>
    </>
  );
}
