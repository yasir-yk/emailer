import Link from 'next/link';
import { ShieldCheck, Mail, Users, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Organization Overview</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor your sending domain status, audience growth, and email deliverability health.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Sending Domains</span>
            <ShieldCheck className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">1</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active & Verified
          </p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Deliverability Score</span>
            <Mail className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">99.4%</p>
          <p className="text-xs text-slate-400 mt-1">Based on DKIM/SPF alignment</p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Subscribers</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">12,450</p>
          <p className="text-xs text-emerald-400 mt-1">+14% this month</p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Compliance Health</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-3">Optimal</p>
          <p className="text-xs text-slate-400 mt-1">DMARC policy set to none</p>
        </div>
      </div>

      {/* Sending Domain Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-sky-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" /> Custom Sending Domain & Compliance setup
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            Configure your custom sending domain (DKIM, SPF, DMARC) to achieve optimal deliverability and protect your brand reputation.
          </p>
        </div>
        <Link href="/dashboard/domains" className="btn-primary shrink-0">
          Manage Domains <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
