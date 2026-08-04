'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
} from 'lucide-react';

interface DnsRecord {
  id: string;
  recordType: 'TXT' | 'CNAME' | 'MX';
  host: string;
  value: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  description?: string;
}

interface SendingDomain {
  id: string;
  domain: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  spfStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  dkimStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  dmarcStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  dnsRecords: DnsRecord[];
  createdAt: string;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<SendingDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<SendingDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDomains = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/domains');
      const data = await res.json();
      if (res.ok) {
        setDomains(data.domains || []);
        if (data.domains?.length > 0 && !selectedDomain) {
          setSelectedDomain(data.domains[0]);
        } else if (data.domains?.length > 0 && selectedDomain) {
          const match = data.domains.find((d: SendingDomain) => d.id === selectedDomain.id);
          if (match) setSelectedDomain(match);
        }
      } else {
        setError(data.error || 'Failed to load domains');
      }
    } catch {
      setError('Connection error while fetching sending domains.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput) return;
    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomainInput }),
      });
      const data = await res.json();

      if (res.ok) {
        setNewDomainInput('');
        setShowAddModal(false);
        setDomains((prev) => [data.domain, ...prev]);
        setSelectedDomain(data.domain);
      } else {
        setError(data.error || 'Failed to add domain');
      }
    } catch {
      setError('Failed to add sending domain');
    } finally {
      setCreating(false);
    }
  };

  const handleVerifyRecords = async (domainId: string) => {
    setVerifying(true);
    setError(null);

    try {
      const res = await fetch(`/api/domains/${domainId}/verify`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setSelectedDomain(data.domain);
        setDomains((prev) => prev.map((d) => (d.id === domainId ? data.domain : d)));
      } else {
        setError(data.error || 'Verification process encountered an error');
      }
    } catch {
      setError('Failed to execute DNS record verification');
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Are you sure you want to remove this sending domain?')) return;

    try {
      const res = await fetch(`/api/domains/${domainId}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = domains.filter((d) => d.id !== domainId);
        setDomains(updated);
        setSelectedDomain(updated[0] || null);
      }
    } catch {
      setError('Failed to delete domain');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: 'PENDING' | 'VERIFIED' | 'FAILED') => {
    if (status === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
        </span>
      );
    }
    if (status === 'FAILED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
          <XCircle className="w-3.5 h-3.5" /> Action Required
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
        <Clock className="w-3.5 h-3.5" /> Pending DNS Check
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-sky-400" /> Sending Domains & Compliance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure custom DNS records (DKIM, SPF, DMARC) to enable high-deliverability sending identity.
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Register Sending Domain
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-3" />
          <p>Loading domain security records...</p>
        </div>
      ) : domains.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Sending Domains Registered</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Register your domain (e.g. mail.yourcompany.com) to generate custom DKIM, SPF, and DMARC authentication keys.
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" /> Add Domain Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Domain Selector List */}
          <div className="glass-panel p-4 space-y-2 lg:col-span-1">
            <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3 px-2">
              Registered Domains
            </h2>
            {domains.map((dom) => (
              <button
                key={dom.id}
                onClick={() => setSelectedDomain(dom)}
                className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between ${
                  selectedDomain?.id === dom.id
                    ? 'bg-sky-500/15 border border-sky-500/30 text-white'
                    : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="truncate">
                  <p className="font-semibold text-sm truncate">{dom.domain}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{dom.status.toLowerCase()}</p>
                </div>
                {dom.status === 'VERIFIED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Selected Domain Records Detail */}
          {selectedDomain && (
            <div className="glass-panel p-6 lg:col-span-3 space-y-6">
              {/* Domain Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{selectedDomain.domain}</h2>
                    {getStatusBadge(selectedDomain.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Added on {new Date(selectedDomain.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleVerifyRecords(selectedDomain.id)}
                    disabled={verifying}
                    className="btn-primary"
                  >
                    <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
                    {verifying ? 'Verifying DNS...' : 'Verify Records'}
                  </button>

                  <button
                    onClick={() => handleDeleteDomain(selectedDomain.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Remove Domain"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Protocol Compliance Pills */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">SPF Authorization</p>
                    <p className="text-sm font-bold text-white mt-0.5">{selectedDomain.spfStatus}</p>
                  </div>
                  {selectedDomain.spfStatus === 'VERIFIED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-400" />
                  )}
                </div>

                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">DKIM Keys</p>
                    <p className="text-sm font-bold text-white mt-0.5">{selectedDomain.dkimStatus}</p>
                  </div>
                  {selectedDomain.dkimStatus === 'VERIFIED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-400" />
                  )}
                </div>

                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">DMARC Policy</p>
                    <p className="text-sm font-bold text-white mt-0.5">{selectedDomain.dmarcStatus}</p>
                  </div>
                  {selectedDomain.dmarcStatus === 'VERIFIED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-400" />
                  )}
                </div>
              </div>

              {/* DNS Instruction Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    DNS Configuration Table
                  </h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Copy these records to your domain provider (Cloudflare, GoDaddy, Namecheap)
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Type</th>
                        <th className="p-3.5">Host / Name</th>
                        <th className="p-3.5">Value / Target</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {selectedDomain.dnsRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3.5 font-bold">
                            <span className="px-2 py-0.5 bg-slate-800 rounded text-[11px] font-mono text-sky-400">
                              {record.recordType}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono max-w-[180px] truncate" title={record.host}>
                            {record.host}
                          </td>
                          <td className="p-3.5 font-mono max-w-[280px] truncate" title={record.value}>
                            {record.value}
                          </td>
                          <td className="p-3.5 text-center">
                            {record.status === 'VERIFIED' ? (
                              <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> OK
                              </span>
                            ) : (
                              <span className="text-amber-400 font-semibold inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => copyToClipboard(record.host, record.id + '-host')}
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 transition-colors"
                              title="Copy Host"
                            >
                              {copiedId === record.id + '-host' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => copyToClipboard(record.value, record.id + '-val')}
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 transition-colors"
                              title="Copy Value"
                            >
                              {copiedId === record.id + '-val' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Register Sending Domain</h2>
            <p className="text-xs text-slate-400">
              Enter the domain or subdomain you plan to send emails from (e.g. mail.mycompany.com or newsletter.brand.com).
            </p>

            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Domain Name
                </label>
                <input
                  type="text"
                  required
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  placeholder="mail.userdomain.com"
                  className="glass-input w-full"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary w-1/2 py-2"
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary w-1/2 py-2">
                  {creating ? 'Generating...' : 'Create & Generate Keys'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
