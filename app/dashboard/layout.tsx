'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Mail,
  ShieldCheck,
  Users,
  Send,
  Building,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  CheckCircle,
  Edit,
  Inbox,
  FileText,
} from 'lucide-react';

interface Org {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrg, setActiveOrg] = useState<Org | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('/api/organizations')
      .then((res) => res.json())
      .then((data) => {
        if (data.organizations && data.organizations.length > 0) {
          setOrgs(data.organizations);
          setActiveOrg(data.organizations[0]);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Newsletter Editor', href: '/dashboard/editor', icon: Edit },
    { name: 'Saved Templates', href: '/dashboard/templates', icon: FileText },
    { name: 'Sending Domains', href: '/dashboard/domains', icon: ShieldCheck },
    { name: 'Campaign Queue', href: '/dashboard/campaigns', icon: Send },
    { name: 'Dev Mailbox', href: '/dashboard/mailbox', icon: Inbox },
    { name: 'Contacts & Lists', href: '/dashboard/contacts', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/80 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-3 py-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-sky-500/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              Emailer<span className="text-sky-400">SaaS</span>
            </span>
          </div>

          {/* Org Switcher */}
          <div className="relative mb-6">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-left hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Building className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">{activeOrg?.name || 'My Organization'}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{activeOrg?.role || 'Owner'}</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-20 overflow-hidden py-1">
                {orgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setActiveOrg(org);
                      setDropdownOpen(false);
                      router.refresh();
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span className="text-slate-200 font-medium">{org.name}</span>
                    {activeOrg?.id === org.id && <CheckCircle className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-2">
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{session?.user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{session?.user?.email || 'user@domain.com'}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
