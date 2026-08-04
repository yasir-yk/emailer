'use client';

import React from 'react';
import { BlockType } from '@/lib/editor/types';
import { Heading, Type, Image as ImageIcon, MousePointerClick, Share2, Minus, Columns, Plus } from 'lucide-react';

interface Props {
  onAddBlock: (type: BlockType) => void;
}

const PALETTE_ITEMS: { type: BlockType; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { type: 'header', label: 'Header Title', icon: Heading, description: 'Bold headline title' },
  { type: 'text', label: 'Text Block', icon: Type, description: 'Paragraph with formatting' },
  { type: 'image', label: 'Image', icon: ImageIcon, description: 'Single image with alt text' },
  { type: 'button', label: 'Button / CTA', icon: MousePointerClick, description: 'Call-to-action button' },
  { type: 'social', label: 'Social Links', icon: Share2, description: 'Social media icon links' },
  { type: 'divider', label: 'Divider Line', icon: Minus, description: 'Horizontal separator line' },
  { type: 'columns_2', label: '2-Column Container', icon: Columns, description: 'Side-by-side content columns' },
];

export function BlockPalette({ onAddBlock }: Props) {
  return (
    <div className="w-64 bg-slate-900/90 border-r border-slate-800 p-4 flex flex-col shrink-0 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-white tracking-tight">Content Blocks</h2>
        <p className="text-xs text-slate-400 mt-0.5">Click or drag to add blocks</p>
      </div>

      <div className="space-y-2.5">
        {PALETTE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              onClick={() => onAddBlock(item.type)}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', item.type)}
              className="w-full bg-slate-950/70 border border-slate-800 hover:border-sky-500/60 hover:bg-sky-500/5 p-3 rounded-xl text-left transition-all group flex items-start gap-3 cursor-grab active:cursor-grabbing"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-sky-500/10 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 truncate">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                  <Plus className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 text-sky-400 transition-opacity" />
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
