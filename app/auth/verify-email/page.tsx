'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Missing verification parameters.');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus('error');
          setMessage(data.error);
        } else {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          setTimeout(() => router.push('/auth/signin'), 3000);
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error during verification.');
      });
  }, [token, email, router]);

  return (
    <div className="w-full max-w-md glass-panel p-8 text-center">
      {status === 'loading' && (
        <div className="py-8">
          <Loader2 className="w-12 h-12 text-sky-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Verifying your email...</h2>
          <p className="text-sm text-slate-400 mt-2">Please wait while we confirm your identity.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
          <p className="text-sm text-slate-300 mb-6">{message}</p>
          <Link href="/auth/signin" className="btn-primary w-full py-2.5">
            Proceed to Sign In
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-6">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-sm text-red-400/90 mb-6">{message}</p>
          <Link href="/auth/signup" className="btn-secondary w-full py-2.5">
            Back to Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
