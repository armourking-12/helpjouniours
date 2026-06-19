import type { Metadata } from "next";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read the latest articles on exam preparation tips, study strategies, and platform updates from HelpJuniors.",
};

const posts = [
  {
    id: "1",
    title: "How to Use PYQs Effectively for Exam Preparation",
    excerpt:
      "Previous year question papers are your secret weapon for acing exams. Here's a proven strategy to use them effectively and maximize your scores.",
    category: "Study Tips",
    readTime: "5 min read",
    date: "June 15, 2026",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "2",
    title: "Introducing AI-Powered Uploads: Just Snap and Upload",
    excerpt:
      "We've launched our most requested feature — AI-powered uploads. Simply take a photo of a question paper and let Gemini AI do the rest.",
    category: "Product Update",
    readTime: "3 min read",
    date: "June 10, 2026",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    id: "3",
    title: "Top 10 Study Strategies for Engineering Students",
    excerpt:
      "Engineering exams can be overwhelming. Here are 10 battle-tested study strategies from top-performing students across India.",
    category: "Study Tips",
    readTime: "7 min read",
    date: "June 5, 2026",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "4",
    title: "How HelpJuniors Ensures Content Quality",
    excerpt:
      "Learn about our moderation process, duplicate detection using SHA-256 hashes, and how we maintain high-quality academic resources.",
    category: "Behind the Scenes",
    readTime: "4 min read",
    date: "May 28, 2026",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "5",
    title: "The Complete Guide to Note-Taking in College",
    excerpt:
      "Cornell method, mind maps, or digital notes? We compare the most popular note-taking methods and help you find what works best.",
    category: "Study Tips",
    readTime: "6 min read",
    date: "May 20, 2026",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    id: "6",
    title: "Contributor Spotlight: Meet Our Top Uploaders",
    excerpt:
      "Get to know the students who have contributed the most resources to HelpJuniors and learn about their motivation.",
    category: "Community",
    readTime: "4 min read",
    date: "May 15, 2026",
    gradient: "from-cyan-500 to-blue-500",
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-transparent blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Blog"
            description="Study tips, platform updates, and stories from the HelpJuniors community."
          />
        </div>
      </section>

      <section className="pb-20 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="stagger">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <AnimatedItem key={post.id}>
                  <article className="group cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-border hover:shadow-lg">
                    {/* Gradient Header Bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${post.gradient}`} />
                    <div className="p-6">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <Tag className="h-3 w-3" />
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold leading-snug transition-colors group-hover:text-indigo-500">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1 text-sm font-medium text-indigo-500 opacity-0 transition-all group-hover:opacity-100">
                          Read more
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedContainer>
        </div>
      </section>
    </>
  );
}
