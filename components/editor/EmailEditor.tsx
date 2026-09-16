'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EmailBlock, BlockType, EmailTemplate } from '@/lib/editor/types';
import { compileToHTML } from '@/lib/editor/compiler';
import { BlockPalette } from './BlockPalette';
import { Canvas } from './Canvas';
import { PropertyPanel } from './PropertyPanel';
import { ExportModal } from './ExportModal';
import { TestEmailModal } from './TestEmailModal';
import {
  Save,
  Send,
  Code,
  Smartphone,
  Monitor,
  ArrowLeft,
  Check,
  X,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

const INITIAL_TEMPLATE: EmailTemplate = {
  id: 'tpl-default',
  name: 'Weekly Digest Newsletter',
  subject: '🚀 Exclusive Weekly Insights & Product Updates',
  preheader: 'Check out our latest news and upcoming releases...',
  senderName: 'Emailer SaaS',
  senderEmail: 'yasir.r.kazmi@gmail.com',
  bodyBgColor: '#f8fafc',
  contentBgColor: '#ffffff',
  updatedAt: new Date().toISOString(),
  blocks: [
    {
      id: 'blk-1',
      type: 'header',
      content: 'Welcome to Our Weekly Digest',
      styles: {
        fontSize: '28px',
        color: '#0f172a',
        textAlign: 'center',
        paddingTop: 30,
        paddingBottom: 10,
        paddingLeft: 25,
        paddingRight: 25,
      },
      properties: {},
    },
    {
      id: 'blk-2',
      type: 'text',
      content: 'Hi {{first_name}}, thank you for subscribing to our newsletter! Here are this week’s top highlights carefully curated for your business.',
      styles: {
        fontSize: '15px',
        color: '#334155',
        textAlign: 'left',
        paddingTop: 10,
        paddingBottom: 20,
        paddingLeft: 25,
        paddingRight: 25,
      },
      properties: {},
    },
    {
      id: 'blk-3',
      type: 'button',
      content: 'Explore Feature Updates',
      styles: {
        fontSize: '15px',
        color: '#ffffff',
        backgroundColor: '#0284c7',
        textAlign: 'center',
        borderRadius: 6,
        paddingTop: 15,
        paddingBottom: 25,
        paddingLeft: 25,
        paddingRight: 25,
      },
      properties: {
        url: 'https://example.com/features',
      },
    },
    {
      id: 'blk-4',
      type: 'divider',
      content: '',
      styles: {
        paddingTop: 10,
        paddingBottom: 15,
        paddingLeft: 25,
        paddingRight: 25,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'solid',
      },
      properties: {},
    },
    {
      id: 'blk-5',
      type: 'text',
      content: 'If you have any questions, feel free to reply to this email. To change your preferences or leave the list, click {{unsubscribe_url}}.',
      styles: {
        fontSize: '12px',
        color: '#94a3b8',
        textAlign: 'center',
        paddingTop: 10,
        paddingBottom: 25,
        paddingLeft: 25,
        paddingRight: 25,
      },
      properties: {},
    },
  ],
};

function EditorContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');

  const [template, setTemplate] = useState<EmailTemplate>(INITIAL_TEMPLATE);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>('blk-1');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Save Modal fields
  const [saveName, setSaveName] = useState(template.name);
  const [saveSubject, setSaveSubject] = useState(template.subject);

  useEffect(() => {
    if (templateId) {
      fetch(`/api/campaigns/${templateId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.campaign) {
            const cmp = data.campaign;
            if (cmp.templateJson) {
              try {
                const parsed = JSON.parse(cmp.templateJson);
                setTemplate({ ...parsed, id: cmp.id });
                setSaveName(parsed.name || cmp.name);
                setSaveSubject(parsed.subject || cmp.subject);
                if (parsed.blocks?.[0]) setSelectedBlockId(parsed.blocks[0].id);
                return;
              } catch (err) {
                console.error('Failed to parse templateJson:', err);
              }
            }
            setTemplate({
              id: cmp.id,
              name: cmp.name,
              subject: cmp.subject,
              preheader: cmp.previewText || '',
              senderName: cmp.senderName || 'Emailer SaaS',
              senderEmail: cmp.senderEmail || 'info@mailtrap.co',
              bodyBgColor: '#f8fafc',
              contentBgColor: '#ffffff',
              updatedAt: cmp.updatedAt || new Date().toISOString(),
              blocks: [
                {
                  id: `blk-${Date.now()}`,
                  type: 'text',
                  content: cmp.templateHtml || 'Edit your newsletter content...',
                  styles: {
                    fontSize: '15px',
                    color: '#1e293b',
                    textAlign: 'left',
                    paddingTop: 15,
                    paddingBottom: 15,
                    paddingLeft: 25,
                    paddingRight: 25,
                  },
                  properties: {},
                },
              ],
            });
            setSaveName(cmp.name);
            setSaveSubject(cmp.subject);
          }
        })
        .catch(() => {});
    }
  }, [templateId]);

  const selectedBlock = template.blocks.find((b) => b.id === selectedBlockId) || null;

  const handleAddBlock = (type: BlockType, targetIndex?: number) => {
    const newBlock: EmailBlock = {
      id: `blk-${Date.now()}`,
      type,
      content:
        type === 'header'
          ? 'New Section Headline'
          : type === 'text'
          ? 'Enter your paragraph text here...'
          : type === 'button'
          ? 'Click Here'
          : '',
      styles: {
        fontSize: type === 'header' ? '24px' : '15px',
        color: '#1e293b',
        textAlign: 'left',
        paddingTop: type === 'image' ? 0 : 15,
        paddingBottom: type === 'image' ? 0 : 15,
        paddingLeft: type === 'image' ? 0 : 25,
        paddingRight: type === 'image' ? 0 : 25,
        backgroundColor: 'transparent',
      },
      properties: {
        imageUrl: type === 'image' ? 'https://via.placeholder.com/600x200' : undefined,
        url: type === 'button' ? 'https://example.com' : undefined,
      },
    };

    const updatedBlocks = [...template.blocks];
    if (typeof targetIndex === 'number') {
      updatedBlocks.splice(targetIndex, 0, newBlock);
    } else {
      updatedBlocks.push(newBlock);
    }

    setTemplate({ ...template, blocks: updatedBlocks });
    setSelectedBlockId(newBlock.id);
  };

  const handleUpdateBlock = (updated: EmailBlock) => {
    setTemplate({
      ...template,
      blocks: template.blocks.map((b) => (b.id === updated.id ? updated : b)),
    });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...template.blocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newBlocks.length) return;

    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIdx, 0, moved);

    setTemplate({ ...template, blocks: newBlocks });
  };

  const handleDuplicateBlock = (id: string) => {
    const idx = template.blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;

    const original = template.blocks[idx];
    const copyBlock: EmailBlock = {
      ...original,
      id: `blk-${Date.now()}`,
    };

    const newBlocks = [...template.blocks];
    newBlocks.splice(idx + 1, 0, copyBlock);

    setTemplate({ ...template, blocks: newBlocks });
    setSelectedBlockId(copyBlock.id);
  };

  const handleDeleteBlock = (id: string) => {
    const updated = template.blocks.filter((b) => b.id !== id);
    setTemplate({ ...template, blocks: updated });
    if (selectedBlockId === id) {
      setSelectedBlockId(updated[0]?.id || null);
    }
  };

  const handleConfirmSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const targetId = templateId || (template.id && !template.id.startsWith('tpl-') ? template.id : null);
      const updatedTemplate = { ...template, id: targetId || template.id, name: saveName, subject: saveSubject };
      setTemplate(updatedTemplate);

      const htmlContent = compileToHTML(updatedTemplate);
      const jsonContent = JSON.stringify(updatedTemplate);

      const url = targetId ? `/api/campaigns/${targetId}` : '/api/campaigns';
      const method = targetId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName || 'Saved Newsletter Template',
          subject: saveSubject || 'Newsletter Update',
          senderName: template.senderName || 'Emailer SaaS',
          senderEmail: template.senderEmail || 'info@mailtrap.co',
          templateHtml: htmlContent,
          templateJson: jsonContent,
        }),
      });

      const data = await res.json();
      if (res.ok && data.campaign) {
        const savedId = data.campaign.id;
        setTemplate((prev) => ({ ...prev, id: savedId }));
        if (!templateId) {
          window.history.replaceState(null, '', `/dashboard/editor?templateId=${savedId}`);
        }
      }

      setShowSaveModal(false);
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2500);
    } catch (e) {
      console.error('Error saving template:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100">
      {/* Top Action Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/templates"
            className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Templates
          </Link>
          <div>
            <input
              type="text"
              value={template.name}
              onChange={(e) => {
                setTemplate({ ...template, name: e.target.value });
                setSaveName(e.target.value);
              }}
              className="bg-transparent font-bold text-white text-base focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1"
            />
            <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-400">From Name:</span>
                <input
                  type="text"
                  value={template.senderName || 'Emailer SaaS'}
                  onChange={(e) => setTemplate({ ...template, senderName: e.target.value })}
                  placeholder="e.g. ChatRadix Team"
                  className="bg-transparent text-sky-400 font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 w-32 truncate"
                />
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1">
                <span>Subject:</span>
                <input
                  type="text"
                  value={template.subject}
                  onChange={(e) => {
                    setTemplate({ ...template, subject: e.target.value });
                    setSaveSubject(e.target.value);
                  }}
                  className="bg-transparent text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 w-52 truncate"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Responsive Viewport Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'desktop' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" /> Desktop (600px)
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'mobile' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Mobile (375px)
          </button>
        </div>

        {/* Right Action Triggers */}
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSaveModal(true)} disabled={isSaving} className="btn-secondary text-xs">
            {savedStatus ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            {savedStatus ? 'Saved to Template Library!' : 'Save Template'}
          </button>
          <button onClick={() => setShowTestModal(true)} className="btn-secondary text-xs">
            <Send className="w-4 h-4 text-sky-400" /> Send Test
          </button>
          <button onClick={() => setShowExportModal(true)} className="btn-primary text-xs">
            <Code className="w-4 h-4" /> Export HTML
          </button>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Drag Palette */}
        <BlockPalette onAddBlock={handleAddBlock} />

        {/* Center: Live Interactive Canvas */}
        <Canvas
          template={template}
          selectedBlockId={selectedBlockId}
          viewMode={viewMode}
          onSelectBlock={setSelectedBlockId}
          onMoveBlock={handleMoveBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onDeleteBlock={handleDeleteBlock}
          onAddBlock={handleAddBlock}
          onUpdateZoom={(zoom) => setTemplate({ ...template, canvasZoom: zoom })}
        />

        {/* Right: Property Inspector */}
        <PropertyPanel
          selectedBlock={selectedBlock}
          template={template}
          onUpdateTemplate={setTemplate}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
        />
      </div>

      {/* SAVE TEMPLATE NAME MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-bold text-white">Save Newsletter Template</h2>
              </div>
              <button onClick={() => setShowSaveModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. Summer Sale Blast"
                  className="glass-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Default Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={saveSubject}
                  onChange={(e) => setSaveSubject(e.target.value)}
                  placeholder="e.g. 🚀 Special Offer Inside"
                  className="glass-input w-full text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="btn-secondary w-1/2 py-2 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary w-1/2 py-2 text-xs">
                  {isSaving ? 'Saving...' : 'Save to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {showExportModal && <ExportModal template={template} onClose={() => setShowExportModal(false)} />}
      {showTestModal && <TestEmailModal template={template} onClose={() => setShowTestModal(false)} />}
    </div>
  );
}

export function EmailEditor() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading newsletter editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
