'use client';

import React, { useState } from 'react';
import { EmailTemplate } from '@/lib/editor/types';
import { compileToHTML, compileToMJML } from '@/lib/editor/compiler';
import { X, Copy, Check, Download, Code, FileText, Braces } from 'lucide-react';

interface Props {
  template: EmailTemplate;
  onClose: () => void;
}

export function ExportModal({ template, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'html' | 'mjml' | 'json'>('html');
  const [copied, setCopied] = useState(false);

  const htmlOutput = compileToHTML(template);
  const mjmlOutput = compileToMJML(template);
  const jsonOutput = JSON.stringify(template, null, 2);

  const currentContent = activeTab === 'html' ? htmlOutput : activeTab === 'mjml' ? mjmlOutput : jsonOutput;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], {
      type: activeTab === 'html' ? 'text/html' : activeTab === 'mjml' ? 'text/xml' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-template.${activeTab}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-panel max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden border border-slate-800">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Export Newsletter Code</h2>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="btn-secondary py-1.5 px-3 text-xs">
              <Download className="w-4 h-4 text-sky-400" /> Download .{activeTab}
            </button>
            <button onClick={handleCopy} className="btn-primary py-1.5 px-3 text-xs">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-950 border-b border-slate-800 px-4">
          <button
            onClick={() => setActiveTab('html')}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'html' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> Compiled HTML (Inline CSS)
          </button>
          <button
            onClick={() => setActiveTab('mjml')}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'mjml' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" /> MJML Source XML
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'json' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Braces className="w-4 h-4" /> JSON Template Schema
          </button>
        </div>

        {/* Code Content View */}
        <div className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs text-slate-300">
          <pre className="whitespace-pre-wrap break-all">{currentContent}</pre>
        </div>
      </div>
    </div>
  );
}
