'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Mail, Lock, User, Building, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ email: string; autoVerified: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, orgName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to sign up');
        setLoading(false);
        return;
      }

      setCreatedInfo({ email, autoVerified: data.autoVerified });

      if (data.autoVerified) {
        // Auto sign-in in dev mode
        await signIn('credentials', { email, password, redirect: false });
        router.push('/dashboard/domains');
      }
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center mx-auto mb-3 border border-sky-500/30">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create SaaS Workspace</h2>
          <p className="text-sm text-slate-400 mt-1">Multi-tenant account & organization setup</p>
        </div>

        {createdInfo && !createdInfo.autoVerified ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Check your email</h3>
            <p className="text-sm text-slate-300 mb-6">
              We sent a verification link to <span className="text-sky-400 font-medium">{createdInfo.email}</span>. Please verify your account to access the dashboard.
            </p>
            <Link href="/auth/signin" className="btn-primary w-full">
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4 text-xs font-semibold">
              <div className={`flex items-center gap-2 ${step === 1 ? 'text-sky-400' : 'text-slate-500'}`}>
                <span className="w-5 h-5 rounded-full bg-slate-800 border flex items-center justify-center text-[10px]">1</span>
                User Credentials
              </div>
              <div className={`flex items-center gap-2 ${step === 2 ? 'text-sky-400' : 'text-slate-500'}`}>
                <span className="w-5 h-5 rounded-full bg-slate-800 border flex items-center justify-center text-[10px]">2</span>
                Organization Setup
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="glass-input pl-10 w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        className="glass-input pl-10 w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="glass-input pl-10 w-full"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!email || !password || !name) {
                        setError('Please complete all fields');
                        return;
                      }
                      setError(null);
                      setStep(2);
                    }}
                    className="btn-primary w-full py-2.5 mt-2"
                  >
                    Next: Organization Setup <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                      Organization / Company Name
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Acme Corp"
                        className="glass-input pl-10 w-full"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">Workspace Settings:</p>
                    <p>• Role: Owner (Full administrative access)</p>
                    <p>• Isolated campaign queue & sending domain identity</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary w-1/3 py-2.5"
                    >
                      Back
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary w-2/3 py-2.5">
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </>
              )}
            </form>

            <p className="text-center text-xs text-slate-400 mt-6">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-sky-400 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
