'use client';

import React, { useState } from 'react';
import { DEFAULT_MERGE_TAGS, MergeTag } from '@/lib/editor/types';
import { Tag, ChevronDown } from 'lucide-react';

interface Props {
  onInsertTag: (tagString: string) => void;
}

export function MergeTagDropdown({ onInsertTag }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 bg-slate-900 border-slate-700 hover:border-sky-500"
      >
        <Tag className="w-3.5 h-3.5 text-sky-400" />
        <span>Insert Tag</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-30 py-1 text-xs">
          <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Available Merge Tags
          </div>
          {DEFAULT_MERGE_TAGS.map((tag: MergeTag) => (
            <button
              key={tag.tag}
              type="button"
              onClick={() => {
                onInsertTag(tag.tag);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center justify-between transition-colors"
            >
              <span className="text-slate-200 font-medium">{tag.label}</span>
              <code className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded font-mono">
                {tag.tag}
              </code>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
