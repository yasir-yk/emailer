'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Send,
  RefreshCw,
  Tag,
  Mail,
} from 'lucide-react';
import Link from 'next/link';

interface SavedTemplate {
  id: string;
  name: string;
  subject: string;
  templateHtml?: string;
  templateJson?: string;
  updatedAt: string;
  createdAt: string;
}

export default function SavedTemplatesPage() {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (res.ok) {
        setTemplates(data.campaigns || []);
      } else {
        setError(data.error || 'Failed to fetch saved templates');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template from your library?')) return;
    setDeletingId(templateId);

    try {
      const res = await fetch(`/api/campaigns/${templateId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      } else {
        setError('Failed to delete template');
      }
    } catch {
      setError('Error deleting template');
    } finally {
      setDeletingId(null);
    }
  };

  const extractMergeVariables = (html?: string): string[] => {
    if (!html) return [];
    const matches = html.match(/\{\{[a-zA-Z0-9_]+\}\}/g);
    return Array.from(new Set(matches || []));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-sky-400" /> Saved Newsletter Templates
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage, edit, and launch bulk campaigns from your saved visual newsletter templates.
          </p>
        </div>
        <Link href="/dashboard/editor" className="btn-primary">
          <Plus className="w-4 h-4" /> Create New Template
        </Link>
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
          <p>Loading template library...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <FileText className="w-12 h-12 text-sky-500/50 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Templates Saved Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Design beautiful newsletter layouts in the drag-and-drop editor and click &quot;Save Template&quot; to build your library.
          </p>
          <Link href="/dashboard/editor" className="btn-primary mx-auto">
            <Plus className="w-4 h-4" /> Design First Template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => {
            const vars = extractMergeVariables(tpl.templateHtml);

            return (
              <div
                key={tpl.id}
                className="glass-panel p-5 flex flex-col justify-between space-y-4 border border-slate-800/80 hover:border-slate-700 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition-colors truncate">
                        {tpl.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase text-slate-500">Default Subject</span>
                    <p className="text-xs text-slate-200 font-medium truncate">
                      {tpl.subject || 'No subject line specified'}
                    </p>
                  </div>

                  {/* Detected Merge Variables */}
                  {vars.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-sky-400" /> Template Variables ({vars.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {vars.map((v) => (
                          <span
                            key={v}
                            className="px-1.5 py-0.5 bg-slate-900 text-sky-400 border border-slate-800 text-[10px] font-mono rounded"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(tpl.updatedAt || tpl.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* EDIT TEMPLATE BUTTON */}
                    <Link
                      href={`/dashboard/editor?templateId=${tpl.id}`}
                      className="btn-secondary py-1.5 px-2.5 text-xs flex items-center gap-1"
                      title="Edit Template in Visual Editor"
                    >
                      <Edit className="w-3.5 h-3.5 text-sky-400" /> Edit
                    </Link>

                    {/* USE IN CAMPAIGN BUTTON (CLONES TEMPLATE FOR CAMPAIGN) */}
                    <Link
                      href={`/dashboard/campaigns?templateId=${tpl.id}`}
                      className="btn-primary py-1.5 px-2.5 text-xs flex items-center gap-1"
                      title="Launch Campaign from this Template"
                    >
                      <Send className="w-3.5 h-3.5" /> Launch Campaign
                    </Link>

                    {/* DELETE TEMPLATE BUTTON */}
                    <button
                      onClick={() => handleDeleteTemplate(tpl.id)}
                      disabled={deletingId === tpl.id}
                      className="btn-secondary text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30 py-1.5 px-2.5 text-xs flex items-center gap-1"
                      title="Delete Template from Library"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
