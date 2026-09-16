'use client';

import React, { useState } from 'react';
import { Send, X, CheckCircle2, AlertCircle, ExternalLink, Mail, User, Building, MapPin, Link2 } from 'lucide-react';
import { compileToHTML } from '@/lib/editor/compiler';
import { EmailTemplate } from '@/lib/editor/types';

interface Props {
  template?: EmailTemplate;
  onClose: () => void;
}

export function TestEmailModal({ template, onClose }: Props) {
  const [recipient, setRecipient] = useState('');
  const [senderName, setSenderName] = useState(template?.senderName || 'Emailer SaaS');
  const [senderEmail, setSenderEmail] = useState(template?.senderEmail || 'yasir.r.kazmi@gmail.com');
  const [sampleFirstName, setSampleFirstName] = useState('Alex');
  const [sampleLastName, setSampleLastName] = useState('Smith');
  const [sampleOrgName, setSampleOrgName] = useState('Acme Marketing Inc');
  const [sampleAddress, setSampleAddress] = useState('123 Business St, Suite 100');
  const [sampleUnsubscribeUrl, setSampleUnsubscribeUrl] = useState('https://example.com/unsubscribe');
  const [sampleBrowserUrl, setSampleBrowserUrl] = useState('https://example.com/view/123');

  const [showAdvancedTags, setShowAdvancedTags] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [etherealUrl, setEtherealUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<string>('ethereal');

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;
    setStatus('sending');
    setErrorMsg('');

    try {
      const htmlContent = template
        ? compileToHTML(template)
        : '<h1>Test Email</h1><p>This is a test email sent from Emailer SaaS.</p>';

      const res = await fetch('/api/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          senderName,
          senderEmail,
          subject: template?.subject || 'Test Email Preview',
          html: htmlContent,
          sampleFirstName,
          sampleLastName,
          sampleOrgName,
          sampleAddress,
          sampleUnsubscribeUrl,
          sampleBrowserUrl,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMode(data.mode);
        if (data.etherealUrl) {
          setEtherealUrl(data.etherealUrl);
        }
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to send test email');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error while dispatching test email');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-panel max-w-lg w-full p-6 space-y-4 my-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Send Test Email</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-left space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-white text-sm">Test Email Dispatched!</h4>
                <p className="text-xs text-slate-300">
                  Recipient: <span className="text-sky-400 font-medium">{recipient}</span>
                </p>
              </div>
            </div>

            {etherealUrl ? (
              <div className="p-3.5 bg-slate-900 border border-sky-500/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" /> Ethereal Dev Inbox Link:
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Click below to view the rendered email in browser:
                </p>
                <a
                  href={etherealUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary py-2 px-3 text-xs w-full justify-center"
                >
                  <ExternalLink className="w-4 h-4" /> Open Rendered Email in Browser
                </a>
              </div>
            ) : mode === 'smtp' ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                🚀 Delivered directly to your inbox via SMTP!
              </div>
            ) : null}

            <button onClick={onClose} className="btn-secondary w-full py-2 text-xs">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendTest} className="space-y-4">
            <p className="text-xs text-slate-400">
              Customize preview recipient details and all merge tag variables before sending.
            </p>

            {status === 'error' && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="you@gmail.com"
                className="glass-input w-full text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  From Name (Sender)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. ChatRadix Team"
                  className="glass-input w-full text-xs font-medium text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  From Address (Email)
                </label>
                <input
                  type="text"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. support@chatradix.com"
                  className="glass-input w-full text-xs font-mono text-slate-300"
                />
              </div>
            </div>

            {/* Editable Merge Tag Inputs */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" /> User Merge Tags
                </span>
                <button
                  type="button"
                  onClick={() => setShowAdvancedTags(!showAdvancedTags)}
                  className="text-[11px] text-sky-400 hover:underline font-semibold"
                >
                  {showAdvancedTags ? 'Hide System Tags' : 'Edit System & Org Tags'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {'{{first_name}}'}
                  </label>
                  <input
                    type="text"
                    value={sampleFirstName}
                    onChange={(e) => setSampleFirstName(e.target.value)}
                    placeholder="Alex"
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {'{{last_name}}'}
                  </label>
                  <input
                    type="text"
                    value={sampleLastName}
                    onChange={(e) => setSampleLastName(e.target.value)}
                    placeholder="Smith"
                    className="glass-input w-full text-xs"
                  />
                </div>
              </div>

              {/* System & Org Merge Tags */}
              {showAdvancedTags && (
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        <Building className="w-3 h-3 text-sky-400" /> {'{{organization_name}}'}
                      </label>
                      <input
                        type="text"
                        value={sampleOrgName}
                        onChange={(e) => setSampleOrgName(e.target.value)}
                        placeholder="Acme Inc"
                        className="glass-input w-full text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-sky-400" /> {'{{company_address}}'}
                      </label>
                      <input
                        type="text"
                        value={sampleAddress}
                        onChange={(e) => setSampleAddress(e.target.value)}
                        placeholder="123 Main St"
                        className="glass-input w-full text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Link2 className="w-3 h-3 text-sky-400" /> {'{{unsubscribe_url}}'}
                    </label>
                    <input
                      type="text"
                      value={sampleUnsubscribeUrl}
                      onChange={(e) => setSampleUnsubscribeUrl(e.target.value)}
                      placeholder="https://example.com/unsubscribe"
                      className="glass-input w-full text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Link2 className="w-3 h-3 text-sky-400" /> {'{{view_in_browser_url}}'}
                    </label>
                    <input
                      type="text"
                      value={sampleBrowserUrl}
                      onChange={(e) => setSampleBrowserUrl(e.target.value)}
                      placeholder="https://example.com/view/123"
                      className="glass-input w-full text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary w-1/2 py-2 text-xs">
                Cancel
              </button>
              <button type="submit" disabled={status === 'sending'} className="btn-primary w-1/2 py-2 text-xs">
                {status === 'sending' ? 'Dispatching...' : 'Send Test Email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
