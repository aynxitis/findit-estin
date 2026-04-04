import Link from "next/link";
import { Nav, Footer, BackgroundBlobs } from "@/components/layout";
import { StatsSection } from "@/components/home/stats-section";
import { ScrollingStrip } from "@/components/home/scrolling-strip";
import { ArrowUpRight, Globe, Mail } from "lucide-react";

export default function Home() {
  return (
    <>
      <BackgroundBlobs />
      <Nav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative z-5 flex flex-col items-center text-center px-6 py-16 gap-5">
          {/* Live badge */}
          <div className="badge animate-fade-up">
            <span className="badge-dot" />
            Live on campus · Free to use
          </div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(2.4rem,8vw,6rem)] font-extrabold leading-[1.05] tracking-[-2px] max-w-[800px] animate-fade-up [animation-delay:100ms]">
            Stop the
            <br />
            email <span className="text-red">spam.</span>
            <br />
            Find your <span className="text-yellow">stuff.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[clamp(0.95rem,2.5vw,1.2rem)] text-muted max-w-[520px] leading-relaxed animate-fade-up [animation-delay:200ms]">
            A smarter lost &amp; found for our campus. Browse what&apos;s been
            found, post what you lost, or report what you found — no campus-wide
            emails.
          </p>
        </section>

        {/* How it works */}
        <section className="relative z-5 max-w-[700px] mx-auto mt-16 px-6 animate-fade-up [animation-delay:250ms]">
          <p className="text-xs tracking-[0.15em] uppercase text-teal font-bold font-display mb-2">
            How it works
          </p>
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.2rem)] font-extrabold tracking-tight mb-8">
            Simple. No inbox chaos.
          </h2>
          
          <div className="flex flex-col gap-7">
            <Step num="01">
              <h3>Sign in with your <span className="text-teal font-semibold">@estin.dz</span> email</h3>
              <p>Just to verify you&apos;re a student at ESTIN — no password, no account creation needed.</p>
            </Step>
            <Step num="02">
              <h3>Lost something or found something?</h3>
              <p>Browse found items first — your stuff might already be there. Or post what you found so the owner can spot it.</p>
            </Step>
            <Step num="03">
              <h3>No more email spam. Find your stuff.</h3>
              <p>&quot;Lost student card&quot;, &quot;Found keys in the restau&quot; Familiar? Post it here — only the people who need to see it will.</p>
            </Step>
          </div>
        </section>

        {/* Divider */}
        <Divider />

        {/* Action Cards */}
        <div className="relative z-5 flex flex-col sm:flex-row gap-4 justify-center px-6 pt-12 animate-fade-up [animation-delay:350ms]">
          <Link href="/browse" className="action-card action-card-lost group">
            <h2 className="font-display text-xl font-extrabold mb-2">I Lost Something</h2>
            <p className="text-sm opacity-75 leading-relaxed">
              Browse found items first — your stuff might already be there. Post a report if it&apos;s not.
            </p>
            <span className="action-card-arrow">
              <ArrowUpRight className="w-5 h-5" />
            </span>
          </Link>
          <Link href="/report/found" className="action-card action-card-found group">
            <h2 className="font-display text-xl font-extrabold mb-2">I Found Something</h2>
            <p className="text-sm opacity-75 leading-relaxed">
              Post what you found so the owner can spot it and reach out to claim it.
            </p>
            <span className="action-card-arrow">
              <ArrowUpRight className="w-5 h-5" />
            </span>
          </Link>
        </div>

        {/* Browse strip */}
        <div className="relative z-5 flex items-center justify-center gap-4 flex-wrap px-6 pt-8 animate-fade-up [animation-delay:450ms]">
          <p className="text-muted text-[0.95rem]">Just looking?</p>
          <Link href="/browse" className="btn-browse">
            Browse all items →
          </Link>
        </div>

        {/* Stats */}
        <StatsSection />

        {/* Divider */}
        <Divider />

        {/* Made by */}
        <section className="relative z-5 max-w-[700px] mx-auto mt-16 px-6">
          <div className="madeby-card">
            <div className="madeby-left">
              <p className="text-xs tracking-[0.15em] uppercase text-teal font-bold font-display mb-2">
                Built by
              </p>
              <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-extrabold tracking-tight leading-tight mb-1">
                Mohamed Anis <span className="text-yellow">BELAMRI</span>
              </h2>
              <p className="text-sm text-muted">1st Year CS Student · ESTIN Bejaia</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <SocialLink href="https://github.com/aynxitis" icon={<GithubIcon />} label="GitHub" />
<SocialLink href="https://www.linkedin.com/in/anis-belamri/" icon={<LinkedinIcon />} label="LinkedIn" />
              <SocialLink href="mailto:am_belamri@estin.dz" icon={<Mail className="w-3.5 h-3.5" />} label="Email" />
              <SocialLink href="https://aynx.vercel.app" icon={<Globe className="w-3.5 h-3.5" />} label="Website" />
            </div>
          </div>
        </section>

        {/* Scrolling Strip */}
        <ScrollingStrip />
      </main>

      <Footer />
    </>
  );
}

function Step({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-6 items-start">
      <span className="font-display text-2xl font-extrabold text-white/10 min-w-12 leading-none">
        {num}
      </span>
      <div className="step-text">
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative z-5 flex items-center gap-3 px-6 mt-14 max-w-[700px] mx-auto">
      <span className="flex-1 h-px bg-white/[0.08]" />
      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
      <span className="flex-1 h-px bg-white/[0.08]" />
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="social-link"
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}


function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

