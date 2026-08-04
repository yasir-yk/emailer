'use client';

import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle2, ExternalLink, ShieldCheck, Eye, MousePointerClick, AlertTriangle } from 'lucide-react';

interface EmailLogItem {
  id: string;
  recipientEmail: string;
  status: string;
  messageId: string;
  openedAt?: string;
  clickedAt?: string;
  errorMessage?: string;
  createdAt: string;
  campaign?: {
    name: string;
    subject: string;
    senderName: string;
    senderEmail: string;
  };
}

export default function DevMailboxPage() {
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<EmailLogItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.campaigns && data.campaigns.length > 0) {
        // Fetch detailed logs for first campaign
        const detailRes = await fetch(`/api/campaigns/${data.campaigns[0].id}`);
        const detailData = await detailRes.json();
        setLogs(detailData.campaign?.emailLogs || []);
        if (detailData.campaign?.emailLogs?.length > 0) {
          setSelectedLog(detailData.campaign.emailLogs[0]);
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Mail className="w-7 h-7 text-sky-400" /> Dev Inbox & Dispatch Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Zero-config local testing: Inspect sent emails, RFC 8058 headers, and Ethereal preview links.
          </p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </div>

      {loading ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-3" />
          <p>Loading email logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Mail className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Email Dispatches Recorded</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Go to <strong>Campaign Queue</strong> or <strong>Newsletter Editor</strong> and click &quot;Send Test Email&quot; or &quot;Dispatch Campaign Now&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logs Sidebar List */}
          <div className="glass-panel p-4 space-y-2 lg:col-span-1">
            <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3 px-2">
              Recent Sent Emails
            </h2>
            {logs.map((log) => (
              <button
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between ${
                  selectedLog?.id === log.id
                    ? 'bg-sky-500/15 border border-sky-500/30 text-white'
                    : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="truncate">
                  <p className="font-semibold text-sm truncate">{log.recipientEmail}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{log.messageId || log.id}</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded">
                  {log.status}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Email Details Panel */}
          {selectedLog && (
            <div className="glass-panel p-6 lg:col-span-2 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">To: {selectedLog.recipientEmail}</h2>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full">
                    {selectedLog.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Message ID: {selectedLog.messageId}</p>
                <p className="text-xs text-slate-500 mt-0.5">Dispatched: {new Date(selectedLog.createdAt).toLocaleString()}</p>
              </div>

              {/* Ethereal Inbox Link */}
              {selectedLog.errorMessage?.includes('http') && (
                <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-400" /> Ethereal Test Inbox Available
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Click below to view the rendered email in Ethereal test inbox.
                    </p>
                  </div>
                  <a
                    href={selectedLog.errorMessage.replace('Preview URL: ', '')}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary py-2 px-3 text-xs shrink-0"
                  >
                    Open Inbox <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Status Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" /> Open Event
                  </span>
                  <span className="text-xs font-bold text-white">
                    {selectedLog.openedAt ? new Date(selectedLog.openedAt).toLocaleTimeString() : 'Not Yet'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5 text-blue-400" /> Click Event
                  </span>
                  <span className="text-xs font-bold text-white">
                    {selectedLog.clickedAt ? new Date(selectedLog.clickedAt).toLocaleTimeString() : 'Not Yet'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
