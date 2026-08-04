import Link from 'next/link';
import { Mail, ShieldCheck, Cpu, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950 font-black">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span>Emailer<span className="text-sky-400">SaaS</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/signin" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-20 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <Zap className="w-3.5 h-3.5" /> High-Deliverability Infrastructure
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
          Enterprise Email Marketing & <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Custom Domain Authentication</span>
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl">
          Complete multi-tenant platform with dynamic SPF, DKIM & DMARC compliance verifiers, high-volume queueing, and organization management.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/auth/signup" className="btn-primary text-base px-6 py-3">
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/dashboard/domains" className="btn-secondary text-base px-6 py-3">
            View Domain Dashboard
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 text-left w-full">
          <div className="glass-panel p-6 hover:border-sky-500/50 transition-colors">
            <ShieldCheck className="w-10 h-10 text-sky-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Automated DKIM & SPF</h3>
            <p className="text-sm text-slate-400">
              Dynamically generate and verify DKIM selectors, SPF include directives, and DMARC policies for 100% inbox placement.
            </p>
          </div>

          <div className="glass-panel p-6 hover:border-sky-500/50 transition-colors">
            <Cpu className="w-10 h-10 text-sky-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Multi-Tenant Architecture</h3>
            <p className="text-sm text-slate-400">
              Isolated workspace organizations with role-based access control (Owner, Admin, Editor) for teams and agencies.
            </p>
          </div>

          <div className="glass-panel p-6 hover:border-sky-500/50 transition-colors">
            <CheckCircle2 className="w-10 h-10 text-sky-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Real-Time DNS Verifier</h3>
            <p className="text-sm text-slate-400">
              Query live DNS servers using Node.js resolvers to instantly validate CNAME & TXT records with copy-to-clipboard support.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        © 2026 Emailer SaaS Inc. All rights reserved.
      </footer>
    </div>
  );
}
