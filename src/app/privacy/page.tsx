import { Nav, Footer, BackgroundBlobs } from "@/components/layout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | FINDit",
  description:
    "Learn how FINDit protects your privacy and handles your data as a student-built platform for ESTIN Bejaia.",
};

export default function PrivacyPolicy() {
  return (
    <>
      <BackgroundBlobs />
      <Nav minimal />
      <main className="flex-1">
        <article className="relative z-5 max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-display font-bold text-white/50 hover:text-yellow transition-colors mb-8"
          >
            ← Back to FINDit
          </Link>

          <p className="text-sm uppercase tracking-widest text-teal font-semibold mb-2">
            Legal
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-1">
            Privacy <span className="text-yellow">Policy</span>
          </h1>
          <p className="text-sm text-white/50 mb-8">Last updated: February 2026</p>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">Who we are</h2>
            <p className="text-sm leading-relaxed text-white/70">
              FINDit is a campus lost &amp; found platform built for students at{" "}
              <strong className="text-white">ESTIN Bejaia</strong>. It was created by a student, for
              students — not a company, not a business. There are no ads, no
              trackers, no data selling.
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">What we collect</h2>
            <p className="text-sm leading-relaxed text-white/70 mb-3">
              When you sign in with Google, we receive the following from your
              Google account:
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              <strong className="text-white">Full name</strong> — to display on your posts and profile.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              <strong className="text-white">Email address</strong> — to verify you&apos;re an ESTIN
              student (must end in @estin.dz) and to allow item owners to contact
              you.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              <strong className="text-white">Profile picture</strong> — displayed in the navigation bar
              while you&apos;re signed in.
            </p>
            <p className="text-sm leading-relaxed text-white/70 mt-3">
              We do not collect passwords. We do not access any other Google
              account data.
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">Why we collect it</h2>
            <p className="text-sm leading-relaxed text-white/70 mb-3">
              Your email is used <strong className="text-white">only</strong> to verify that you&apos;re
              a student at ESTIN. Without this check, anyone on the internet
              could post to the platform.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              Your name and photo are used to make the experience feel personal
              and to show item ownership. Your contact email may be shared with
              another verified ESTIN student if their lost item matches something
              you found — this is the core purpose of the app.
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">How we store it</h2>
            <p className="text-sm leading-relaxed text-white/70">
              Your data is stored in <strong className="text-white">Firebase Firestore</strong>, a
              Google Cloud database. Access is restricted to verified @estin.dz
              accounts only. No third parties have access to your data.
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">Who can see your data</h2>
            <p className="text-sm leading-relaxed text-white/70">
              Your <strong className="text-white">name</strong> is visible to other signed-in ESTIN
              students when you post a lost or found item.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              Your <strong className="text-white">email</strong> is only shared when a match is made
              between a lost and found item — to allow the two parties to
              connect.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              Your <strong className="text-white">profile picture</strong> is only visible to you in the
              nav bar.
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">How to delete your data</h2>
            <p className="text-sm leading-relaxed text-white/70">
              To have your account and all associated data permanently deleted,
              send an email to{" "}
              <a href="mailto:am_belamri@estin.dz" className="legal-link">
                am_belamri@estin.dz
              </a>{" "}
              with the subject line{" "}
              <strong className="text-white">&quot;Delete my FINDit account&quot;</strong>. Your data will be
              removed within 7 days.
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">Contact</h2>
            <p className="text-sm leading-relaxed text-white/70">
              Questions about this policy? Reach out at{" "}
              <a href="mailto:am_belamri@estin.dz" className="legal-link">
                am_belamri@estin.dz
              </a>{" "}
              or on{" "}
              <a
                href="https://github.com/aynxitis"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                GitHub
              </a>
              .
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
