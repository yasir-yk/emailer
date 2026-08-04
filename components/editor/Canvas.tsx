'use client';

import React from 'react';
import { EmailBlock, BlockType, EmailTemplate } from '@/lib/editor/types';
import { substituteMergeTags, getSocialDefaultIcon } from '@/lib/editor/compiler';
import { ArrowUp, ArrowDown, Copy, Trash2, Plus } from 'lucide-react';

interface Props {
  template: EmailTemplate;
  selectedBlockId: string | null;
  viewMode: 'desktop' | 'mobile';
  onSelectBlock: (id: string) => void;
  onMoveBlock: (index: number, direction: 'up' | 'down') => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock: (type: BlockType, index?: number) => void;
}

export function Canvas({
  template,
  selectedBlockId,
  viewMode,
  onSelectBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onAddBlock,
}: Props) {
  const containerWidth = viewMode === 'mobile' ? 'w-[375px]' : 'w-[600px]';

  const handleDrop = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain') as BlockType;
    if (type) {
      onAddBlock(type, targetIndex);
    }
  };

  const renderBlockContent = (block: EmailBlock) => {
    const s = block.styles;
    const p = block.properties;
    const pt = s.paddingTop ?? 10;
    const pb = s.paddingBottom ?? 10;
    const pl = s.paddingLeft ?? 25;
    const pr = s.paddingRight ?? 25;
    const align = s.textAlign || 'left';
    const color = s.color || '#1e293b';
    const fontSize = s.fontSize || '16px';
    const bg = s.backgroundColor || 'transparent';

    const parsedContent = substituteMergeTags(block.content, template.sampleValues);

    switch (block.type) {
      case 'header':
        return (
          <div style={{ padding: `${pt}px ${pr}px ${pb}px ${pl}px`, backgroundColor: bg, textAlign: align }}>
            <h1 style={{ margin: 0, color, fontSize, fontWeight: 700, lineHeight: 1.3 }}>{parsedContent}</h1>
          </div>
        );

      case 'text':
        return (
          <div style={{ padding: `${pt}px ${pr}px ${pb}px ${pl}px`, backgroundColor: bg, textAlign: align }}>
            <div
              style={{ color, fontSize, lineHeight: s.lineHeight || '1.6' }}
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
          </div>
        );

      case 'image':
        return (
          <div style={{ padding: `${pt}px ${pr}px ${pb}px ${pl}px`, backgroundColor: bg, textAlign: align }}>
            <img
              src={p.imageUrl || 'https://via.placeholder.com/600x200'}
              alt={p.altText || ''}
              style={{
                display: 'inline-block',
                maxWidth: '100%',
                borderRadius: `${s.borderRadius || 0}px`,
              }}
            />
          </div>
        );

      case 'button':
        return (
          <div style={{ padding: `${pt}px ${pr}px ${pb}px ${pl}px`, backgroundColor: bg, textAlign: align }}>
            <span
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: s.backgroundColor || '#0284c7',
                color,
                fontSize,
                fontWeight: 700,
                borderRadius: `${s.borderRadius || 6}px`,
                textDecoration: 'none',
              }}
            >
              {parsedContent}
            </span>
          </div>
        );

      case 'social': {
        const links = p.socialLinks || [
          { platform: 'facebook', url: '#', iconUrl: getSocialDefaultIcon('facebook') },
          { platform: 'twitter', url: '#', iconUrl: getSocialDefaultIcon('twitter') },
          { platform: 'instagram', url: '#', iconUrl: getSocialDefaultIcon('instagram') },
        ];
        return (
          <div style={{ padding: `${pt}px ${pr}px ${pb}px ${pl}px`, backgroundColor: bg, textAlign: align }}>
            <div className="flex gap-4 justify-center items-center">
              {links.map((link, idx) => (
                <img
                  key={idx}
                  src={link.iconUrl || getSocialDefaultIcon(link.platform)}
                  alt={link.platform}
                  className="w-7 h-7 object-contain inline-block"
                />
              ))}
            </div>
          </div>
        );
      }

      case 'divider':
        return (
          <div style={{ padding: `${pt}px ${pr}px ${pb}px ${pl}px`, backgroundColor: bg }}>
            <hr style={{ border: 0, borderTop: `${s.borderWidth || 1}px ${s.borderStyle || 'solid'} ${s.borderColor || '#e2e8f0'}`, margin: 0 }} />
          </div>
        );

      case 'columns_2':
        return (
          <div style={{ padding: `${pt}px ${pr}px ${pb}px ${pl}px`, backgroundColor: bg }} className="grid grid-cols-2 gap-4">
            <div style={{ backgroundColor: p.column1Bg || 'transparent', padding: '8px' }} className="text-xs text-slate-800">
              {p.column1Content || 'Column 1 Content'}
            </div>
            <div style={{ backgroundColor: p.column2Bg || 'transparent', padding: '8px' }} className="text-xs text-slate-800">
              {p.column2Content || 'Column 2 Content'}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 md:p-10 flex flex-col items-center overflow-y-auto relative">
      {/* Container Frame */}
      <div
        className={`${containerWidth} transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-slate-800 bg-white`}
        style={{ backgroundColor: template.contentBgColor || '#ffffff' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e)}
      >
        {template.blocks.length === 0 ? (
          <div className="p-16 text-center text-slate-400 border-2 border-dashed border-slate-300 m-4 rounded-xl">
            <p className="font-bold text-slate-600 mb-1">Canvas is Empty</p>
            <p className="text-xs text-slate-400">Click or drag elements from the left panel to build your email.</p>
          </div>
        ) : (
          template.blocks.map((block, idx) => {
            const isSelected = selectedBlockId === block.id;

            return (
              <div
                key={block.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBlock(block.id);
                }}
                className={`relative group transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-white z-10'
                    : 'hover:outline hover:outline-1 hover:outline-sky-400'
                }`}
              >
                {/* Block Floating Control Bar */}
                <div
                  className={`absolute -top-3 right-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl px-1.5 py-1 flex items-center gap-1 z-20 transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <button
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveBlock(idx, 'up');
                    }}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === template.blocks.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveBlock(idx, 'down');
                    }}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateBlock(block.id);
                    }}
                    className="p-1 text-slate-400 hover:text-sky-400"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBlock(block.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {renderBlockContent(block)}
              </div>
            );
          })
        )}
      </div>

      {/* Add Block Bottom Indicator */}
      <button
        onClick={() => onAddBlock('text')}
        className="mt-6 btn-secondary text-xs flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
      >
        <Plus className="w-4 h-4 text-sky-400" /> Add Text Block
      </button>
    </div>
  );
}
