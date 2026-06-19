import type { Metadata } from "next";
import { Mail, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the HelpJuniors team. We'd love to hear from you — feedback, questions, or partnership inquiries.",
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    description: "For general inquiries and support",
    value: "hello@helpjuniors.app",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: MessageSquare,
    title: "Community",
    description: "Join our student community",
    value: "Discord Server",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Clock,
    title: "Response Time",
    description: "We typically respond within",
    value: "24 hours",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Contact Us"
            description="Have a question, feedback, or partnership inquiry? We'd love to hear from you."
          />
        </div>
      </section>

      <section className="pb-20 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <AnimatedContainer variant="stagger">
                <div className="space-y-4">
                  {contactInfo.map((info) => (
                    <AnimatedItem key={info.title}>
                      <div className="rounded-2xl border border-border/50 bg-card p-5 transition-all hover:shadow-md">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${info.gradient} shadow-md`}
                          >
                            <info.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{info.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {info.description}
                            </p>
                            <p className="mt-1 text-sm font-medium text-indigo-500">
                              {info.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    </AnimatedItem>
                  ))}
                </div>
              </AnimatedContainer>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <AnimatedContainer variant="fadeUp">
                <div className="rounded-2xl border border-border/50 bg-card p-6 md:p-8">
                  <h2 className="text-xl font-semibold">Send us a message</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fill out the form below and we&apos;ll get back to you soon.
                  </p>
                  <form className="mt-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="mb-1.5 block text-sm font-medium"
                        >
                          Name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          placeholder="Your name"
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="mb-1.5 block text-sm font-medium"
                        >
                          Email
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          placeholder="you@example.com"
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        placeholder="What's this about?"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-message"
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={5}
                        placeholder="Tell us more..."
                        className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:brightness-110"
                    >
                      <Send className="h-4 w-4" />
                      Send Message
                    </button>
                  </form>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
