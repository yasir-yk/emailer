'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Mail,
  Zap,
  BarChart3,
  ExternalLink,
  Eye,
  MousePointerClick,
  X,
  Trash2,
  Users,
  FileText,
  Tag,
  Edit,
  AlertCircle,
} from 'lucide-react';

interface CampaignStats {
  totalRecipients: number;
  processedCount: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  complaintCount: number;
}

interface EmailLogItem {
  id: string;
  recipientEmail: string;
  status: string;
  messageId: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  errorMessage?: string;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  previewText?: string;
  senderName: string;
  senderEmail: string;
  templateHtml?: string;
  templateJson?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  createdAt: string;
  sentAt?: string;
  stats?: CampaignStats;
  contactList?: {
    contacts?: { email: string }[];
  };
}

function CampaignsContent() {
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaignRecipients, setEditingCampaignRecipients] = useState<Campaign | null>(null);
  const [recipientInput, setRecipientInput] = useState('yasir.r.kazmi@gmail.com');
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Recipient Logs Modal state
  const [selectedCampaignLogs, setSelectedCampaignLogs] = useState<{
    campaign: Campaign;
    logs: EmailLogItem[];
  } | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // New Campaign Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [senderName, setSenderName] = useState('Marketing Team');
  const [senderEmail, setSenderEmail] = useState('info@mailtrap.co');
  const [recipientEmails, setRecipientEmails] = useState('yasir.r.kazmi@gmail.com');
  const [templateHtml, setTemplateHtml] = useState('');

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (res.ok) {
        setCampaigns(data.campaigns || []);
      } else {
        setError(data.error || 'Failed to fetch campaigns');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const extractMergeVariables = (html: string): string[] => {
    if (!html) return [];
    const matches = html.match(/\{\{[a-zA-Z0-9_]+\}\}/g);
    return Array.from(new Set(matches || []));
  };

  const detectedVariables = extractMergeVariables(templateHtml);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const matched = campaigns.find((c) => c.id === templateId);
    if (matched) {
      setName(matched.name);
      setSubject(matched.subject);
      setSenderName(matched.senderName || 'Marketing Team');
      setSenderEmail(matched.senderEmail || 'info@mailtrap.co');
      if (matched.templateHtml) {
        setTemplateHtml(matched.templateHtml);
      }
    }
  };

  useEffect(() => {
    const tplParam = searchParams.get('templateId');
    if (tplParam && campaigns.length > 0) {
      handleSelectTemplate(tplParam);
      setShowCreateModal(true);
    }
  }, [searchParams, campaigns]);

  const handleOpenLogs = async (campaign: Campaign) => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedCampaignLogs({
          campaign,
          logs: data.campaign?.emailLogs || [],
        });
      }
    } catch {
      setError('Failed to fetch recipient email logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject) return;

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subject,
          senderName,
          senderEmail,
          recipientEmails,
          templateHtml: templateHtml || `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h1>Hi {{first_name}},</h1>
              <p>Welcome to our official update! We are excited to share product announcements with you.</p>
              <p><a href="https://userdomain.com/features">Click here to explore new features</a></p>
              <hr />
              <p style="font-size: 12px; color: #888;">To unsubscribe, click {{unsubscribe_url}}</p>
            </div>
          `,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowCreateModal(false);
        setName('');
        setSubject('');
        setSelectedTemplateId('');
        setCampaigns((prev) => [data.campaign, ...prev]);
      } else {
        setError(data.error || 'Failed to create campaign');
      }
    } catch {
      setError('Failed to create campaign');
    }
  };

  const handleDispatchNow = async (campaign: Campaign) => {
    const totalRecipients = campaign.stats?.totalRecipients || 0;

    // Prompt for recipient emails if none are set
    if (totalRecipients === 0) {
      const currentEmails = campaign.contactList?.contacts?.map((c) => c.email).join(', ') || 'yasir.r.kazmi@gmail.com';
      setRecipientInput(currentEmails);
      setEditingCampaignRecipients(campaign);
      return;
    }

    setDispatchingId(campaign.id);
    setError(null);

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (res.ok) {
        fetchCampaigns();
      } else {
        setError(data.error || 'Dispatch failed');
      }
    } catch {
      setError('Dispatch connection error');
    } finally {
      setDispatchingId(null);
    }
  };

  const handleSaveRecipientsAndDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaignRecipients || !recipientInput) return;

    try {
      const updateRes = await fetch(`/api/campaigns/${editingCampaignRecipients.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmails: recipientInput,
        }),
      });

      if (!updateRes.ok) {
        setError('Failed to save target recipient emails');
        return;
      }

      setEditingCampaignRecipients(null);

      setDispatchingId(editingCampaignRecipients.id);
      const res = await fetch(`/api/campaigns/${editingCampaignRecipients.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        fetchCampaigns();
      } else {
        const data = await res.json();
        setError(data.error || 'Dispatch failed');
      }
    } catch {
      setError('Error setting recipients and dispatching campaign');
    } finally {
      setDispatchingId(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign and all its queue logs?')) return;
    setDeletingId(campaignId);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      } else {
        setError('Failed to delete campaign');
      }
    } catch {
      setError('Error deleting campaign');
    } finally {
      setDeletingId(null);
    }
  };

  const simulateOpen = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      const data = await res.json();
      const firstLog = data.campaign?.emailLogs?.[0];

      if (firstLog) {
        await fetch(`/api/track/open?logId=${firstLog.id}`);
        fetchCampaigns();
      }
    } catch {}
  };

  const simulateClick = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      const data = await res.json();
      const firstLog = data.campaign?.emailLogs?.[0];

      if (firstLog) {
        await fetch(`/api/track/click?logId=${firstLog.id}&target=${encodeURIComponent('https://example.com')}`);
        fetchCampaigns();
      }
    } catch {}
  };

  const simulateBounce = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      const data = await res.json();
      const firstLog = data.campaign?.emailLogs?.[0];

      if (firstLog) {
        await fetch('/api/webhooks/esp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType: 'BOUNCE', logId: firstLog.id }),
        });
        fetchCampaigns();
      }
    } catch {}
  };

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing Queue
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" /> Scheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
            Draft Template
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Send className="w-7 h-7 text-sky-400" /> Scalable Campaign Dispatch Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Set target recipient emails, dispatch bulk queues, and monitor real-time delivery metrics.
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create New Campaign
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-3" />
          <p>Loading campaign queue history...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Zap className="w-12 h-12 text-sky-500/50 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Campaigns Created Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Create your first bulk campaign or select a saved newsletter template to dispatch.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" /> Launch Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {campaigns.map((cmp) => {
            const stats = cmp.stats || {
              totalRecipients: 0,
              sentCount: 0,
              openCount: 0,
              clickCount: 0,
              bounceCount: 0,
            };

            const openRate = stats.sentCount > 0 ? ((stats.openCount / stats.sentCount) * 100).toFixed(1) : '0';
            const clickRate = stats.openCount > 0 ? ((stats.clickCount / stats.openCount) * 100).toFixed(1) : '0';

            return (
              <div key={cmp.id} className="glass-panel p-6 space-y-6 border border-slate-800/80 relative">
                {/* Campaign Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-white">{cmp.name}</h2>
                      {getStatusBadge(cmp.status)}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Subject: &quot;{cmp.subject}&quot; • Sender: {cmp.senderName} ({cmp.senderEmail})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* EDIT RECIPIENTS BUTTON */}
                    <button
                      onClick={() => {
                        setRecipientInput(cmp.contactList?.contacts?.map((c) => c.email).join(', ') || 'yasir.r.kazmi@gmail.com');
                        setEditingCampaignRecipients(cmp);
                      }}
                      className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                      title="Edit Target Recipient Emails"
                    >
                      <Users className="w-3.5 h-3.5 text-sky-400" /> Recipients ({stats.totalRecipients})
                    </button>

                    {cmp.status !== 'COMPLETED' && cmp.status !== 'PROCESSING' && (
                      <button
                        onClick={() => handleDispatchNow(cmp)}
                        disabled={dispatchingId === cmp.id}
                        className="btn-primary py-2 px-4 text-xs"
                      >
                        <Play className={`w-3.5 h-3.5 ${dispatchingId === cmp.id ? 'animate-spin' : ''}`} />
                        {dispatchingId === cmp.id ? 'Dispatching Queue...' : 'Dispatch Campaign Now'}
                      </button>
                    )}

                    {cmp.status === 'COMPLETED' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => simulateOpen(cmp.id)}
                          className="btn-secondary py-1.5 px-3 text-xs"
                          title="Simulate Open Event"
                        >
                          + Simulate Open
                        </button>
                        <button
                          onClick={() => simulateClick(cmp.id)}
                          className="btn-secondary py-1.5 px-3 text-xs"
                          title="Simulate Click Event"
                        >
                          + Simulate Click
                        </button>
                        <button
                          onClick={() => simulateBounce(cmp.id)}
                          className="btn-secondary py-1.5 px-3 text-xs text-amber-400"
                          title="Simulate Bounce Webhook"
                        >
                          + Simulate Bounce
                        </button>
                      </div>
                    )}

                    {/* DELETE CAMPAIGN BUTTON */}
                    <button
                      onClick={() => handleDeleteCampaign(cmp.id)}
                      disabled={deletingId === cmp.id}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Campaign Queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Queue & Analytics Metrics Grid (Clickable Dispatched Card) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Recipients</span>
                    <p className="text-xl font-bold text-white mt-1">{stats.totalRecipients}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Chunk size: 1,000</p>
                  </div>

                  {/* CLICKABLE DISPATCHED CARD */}
                  <button
                    onClick={() => handleOpenLogs(cmp)}
                    className="bg-slate-950 p-3.5 rounded-lg border border-sky-500/30 hover:border-sky-500/80 hover:bg-sky-500/10 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-sky-400 uppercase">Dispatched</span>
                      <ExternalLink className="w-3.5 h-3.5 text-sky-400 opacity-60 group-hover:opacity-100" />
                    </div>
                    <p className="text-xl font-extrabold text-sky-400 mt-1 flex items-center gap-1.5">
                      {stats.sentCount}
                      <span className="text-[10px] font-normal text-slate-400 group-hover:text-white underline">
                        (View Emails)
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 group-hover:text-sky-300">
                      Click to view recipient emails ➔
                    </p>
                  </button>

                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Unique Opens</span>
                    <p className="text-xl font-bold text-emerald-400 mt-1">{stats.openCount}</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">{openRate}% open rate</p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Link Clicks</span>
                    <p className="text-xl font-bold text-blue-400 mt-1">{stats.clickCount}</p>
                    <p className="text-[10px] text-blue-400 mt-0.5">{clickRate}% click-to-open</p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Bounces / Spam</span>
                    <p className="text-xl font-bold text-amber-400 mt-1">{stats.bounceCount}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">ESP Webhook synced</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT RECIPIENTS BEFORE DISPATCH MODAL */}
      {editingCampaignRecipients && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-bold text-white">Target Recipient Emails</h2>
              </div>
              <button
                onClick={() => setEditingCampaignRecipients(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipientsAndDispatch} className="space-y-4">
              <p className="text-xs text-slate-400">
                Specify recipient emails for campaign <span className="text-white font-semibold">&quot;{editingCampaignRecipients.name}&quot;</span>:
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Recipient Emails (Comma or newline separated)
                </label>
                <textarea
                  rows={3}
                  required
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder="yasir.r.kazmi@gmail.com, alex@example.com"
                  className="glass-input w-full font-mono text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCampaignRecipients(null)}
                  className="btn-secondary w-1/2 py-2 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary w-1/2 py-2 text-xs">
                  Save & Dispatch Now 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatched Emails Modal with Details & Error Log Column */}
      {selectedCampaignLogs && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel max-w-4xl w-full max-h-[85vh] flex flex-col p-6 overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-sky-400" />
                  <h2 className="text-lg font-bold text-white">Dispatched Recipient Emails</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Campaign: <span className="text-white font-semibold">&quot;{selectedCampaignLogs.campaign.name}&quot;</span> ({selectedCampaignLogs.logs.length} dispatched records)
                </p>
              </div>
              <button
                onClick={() => setSelectedCampaignLogs(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingLogs ? (
              <div className="p-8 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-400 mb-2" />
                <p className="text-xs">Fetching recipient email logs...</p>
              </div>
            ) : selectedCampaignLogs.logs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm">No dispatched logs recorded for this campaign yet.</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 border border-slate-800 rounded-xl bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-3.5">Recipient Email</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Delivery Details / Error Log</th>
                      <th className="p-3.5 text-right">Dispatched At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {selectedCampaignLogs.logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5 font-medium text-white flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{log.recipientEmail}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              log.status === 'CLICKED'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : log.status === 'OPENED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : log.status === 'FAILED' || log.status === 'BOUNCED'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">
                          {log.errorMessage ? (
                            <span className="text-red-400 text-[11px] flex items-center gap-1" title={log.errorMessage}>
                              <AlertCircle className="w-3 h-3 shrink-0" /> {log.errorMessage}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] truncate max-w-[200px] block">
                              {log.messageId || 'Delivered'}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Campaign Modal with Saved Newsletter Template Selector */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 my-8">
            <h2 className="text-xl font-bold text-white">Create New Bulk Campaign</h2>
            <p className="text-xs text-slate-400">
              Select a saved newsletter template or create a new campaign from scratch.
            </p>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              {/* SELECT SAVED NEWSLETTER TEMPLATE DROPDOWN */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-400" /> Select Saved Newsletter Template
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Optional</span>
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  className="glass-input w-full text-xs font-semibold py-2"
                >
                  <option value="">-- Choose from Saved Newsletter Library --</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Subject: {c.subject})
                    </option>
                  ))}
                </select>
              </div>

              {/* DETECTED MERGE VARIABLES BADGE */}
              {detectedVariables.length > 0 && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Tag className="w-3.5 h-3.5 text-sky-400" />
                    <span>Merge Variables Detected in Template:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {detectedVariables.map((v) => (
                      <span key={v} className="px-2 py-0.5 bg-sky-950/80 text-sky-400 border border-sky-500/30 text-[10px] font-mono rounded">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Q3 Product Announcement"
                  className="glass-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="🚀 Major platform updates are here"
                  className="glass-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Sender Email
                  </label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="glass-input w-full text-xs"
                  />
                </div>
              </div>

              {/* RECIPIENT EMAILS CONTROL */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-sky-400" /> Target Recipient Emails
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Comma separated</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={recipientEmails}
                  onChange={(e) => setRecipientEmails(e.target.value)}
                  placeholder="yasir.r.kazmi@gmail.com, alex@example.com"
                  className="glass-input w-full font-mono text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary w-1/2 py-2 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary w-1/2 py-2 text-xs">
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading campaign queue...</div>}>
      <CampaignsContent />
    </Suspense>
  );
}
