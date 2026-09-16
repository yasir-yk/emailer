'use client';

import React, { useState } from 'react';
import { EmailBlock, SocialLink, DEFAULT_MERGE_TAGS, EmailTemplate } from '@/lib/editor/types';
import { MergeTagDropdown } from './MergeTagDropdown';
import { getSocialDefaultIcon } from '@/lib/editor/compiler';
import {
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Upload,
  Plus,
  Link2,
  User,
  Building,
  MapPin,
  Tag,
} from 'lucide-react';

interface Props {
  selectedBlock: EmailBlock | null;
  template: EmailTemplate;
  onUpdateTemplate: (updated: EmailTemplate) => void;
  onUpdateBlock: (updated: EmailBlock) => void;
  onDeleteBlock: (id: string) => void;
}

export function PropertyPanel({
  selectedBlock,
  template,
  onUpdateTemplate,
  onUpdateBlock,
  onDeleteBlock,
}: Props) {
  const [showSystemTags, setShowSystemTags] = useState(true);

  const sampleValues = template.sampleValues || {
    '{{first_name}}': 'Alex',
    '{{last_name}}': 'Smith',
    '{{organization_name}}': 'Acme Marketing Inc',
    '{{company_address}}': '123 Business St, Suite 100',
    '{{unsubscribe_url}}': 'https://example.com/unsubscribe',
    '{{view_in_browser_url}}': 'https://example.com/view/123',
  };

  const handleUpdateSampleValue = (tag: string, value: string) => {
    const updated = {
      ...template,
      sampleValues: {
        ...sampleValues,
        [tag]: value,
      },
    };
    onUpdateTemplate(updated);
  };

  const handleInsertMergeTag = (tag: string) => {
    if (!selectedBlock) return;
    if (selectedBlock.type === 'columns_2') {
      onUpdateBlock({
        ...selectedBlock,
        properties: {
          ...selectedBlock.properties,
          column1Content: (selectedBlock.properties.column1Content || '') + ' ' + tag,
        },
      });
    } else {
      onUpdateBlock({
        ...selectedBlock,
        content: selectedBlock.content + ' ' + tag,
      });
    }
  };

  // Render Sidebar Merge Tags Card (Matching Screenshot)
  const renderMergeTagsCard = () => (
    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-sky-400" /> User Merge Tags
        </span>
        <button
          type="button"
          onClick={() => setShowSystemTags(!showSystemTags)}
          className="text-[11px] text-sky-400 hover:underline font-semibold"
        >
          {showSystemTags ? 'Hide System Tags' : 'Show System Tags'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-semibold text-slate-400">{'{{first_name}}'}</label>
            {selectedBlock && (
              <button
                type="button"
                onClick={() => handleInsertMergeTag('{{first_name}}')}
                className="text-[9px] text-sky-400 hover:underline font-bold"
              >
                + Insert
              </button>
            )}
          </div>
          <input
            type="text"
            value={sampleValues['{{first_name}}'] || 'Alex'}
            onChange={(e) => handleUpdateSampleValue('{{first_name}}', e.target.value)}
            placeholder="Alex"
            className="glass-input w-full text-xs py-1"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-semibold text-slate-400">{'{{last_name}}'}</label>
            {selectedBlock && (
              <button
                type="button"
                onClick={() => handleInsertMergeTag('{{last_name}}')}
                className="text-[9px] text-sky-400 hover:underline font-bold"
              >
                + Insert
              </button>
            )}
          </div>
          <input
            type="text"
            value={sampleValues['{{last_name}}'] || 'Smith'}
            onChange={(e) => handleUpdateSampleValue('{{last_name}}', e.target.value)}
            placeholder="Smith"
            className="glass-input w-full text-xs py-1"
          />
        </div>
      </div>

      {showSystemTags && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Building className="w-2.5 h-2.5 text-sky-400" /> {'{{organization_name}}'}
                </label>
                {selectedBlock && (
                  <button
                    type="button"
                    onClick={() => handleInsertMergeTag('{{organization_name}}')}
                    className="text-[9px] text-sky-400 hover:underline font-bold"
                  >
                    + Insert
                  </button>
                )}
              </div>
              <input
                type="text"
                value={sampleValues['{{organization_name}}'] || 'Acme Marketing Inc'}
                onChange={(e) => handleUpdateSampleValue('{{organization_name}}', e.target.value)}
                placeholder="Acme Inc"
                className="glass-input w-full text-xs py-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-sky-400" /> {'{{company_address}}'}
                </label>
                {selectedBlock && (
                  <button
                    type="button"
                    onClick={() => handleInsertMergeTag('{{company_address}}')}
                    className="text-[9px] text-sky-400 hover:underline font-bold"
                  >
                    + Insert
                  </button>
                )}
              </div>
              <input
                type="text"
                value={sampleValues['{{company_address}}'] || '123 Business St, Suite 100'}
                onChange={(e) => handleUpdateSampleValue('{{company_address}}', e.target.value)}
                placeholder="123 Main St"
                className="glass-input w-full text-xs py-1"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Link2 className="w-2.5 h-2.5 text-sky-400" /> {'{{unsubscribe_url}}'}
              </label>
              {selectedBlock && (
                <button
                  type="button"
                  onClick={() => handleInsertMergeTag('{{unsubscribe_url}}')}
                  className="text-[9px] text-sky-400 hover:underline font-bold"
                >
                  + Insert
                </button>
              )}
            </div>
            <input
              type="text"
              value={sampleValues['{{unsubscribe_url}}'] || 'https://example.com/unsubscribe'}
              onChange={(e) => handleUpdateSampleValue('{{unsubscribe_url}}', e.target.value)}
              placeholder="https://example.com/unsubscribe"
              className="glass-input w-full text-xs py-1 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Link2 className="w-2.5 h-2.5 text-sky-400" /> {'{{view_in_browser_url}}'}
              </label>
              {selectedBlock && (
                <button
                  type="button"
                  onClick={() => handleInsertMergeTag('{{view_in_browser_url}}')}
                  className="text-[9px] text-sky-400 hover:underline font-bold"
                >
                  + Insert
                </button>
              )}
            </div>
            <input
              type="text"
              value={sampleValues['{{view_in_browser_url}}'] || 'https://example.com/view/123'}
              onChange={(e) => handleUpdateSampleValue('{{view_in_browser_url}}', e.target.value)}
              placeholder="https://example.com/view/123"
              className="glass-input w-full text-xs py-1 font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );

  if (!selectedBlock) {
    return (
      <div className="w-80 bg-slate-900/90 border-l border-slate-800 p-5 flex flex-col shrink-0 space-y-6 overflow-y-auto">
        <div className="text-center py-2">
          <Sliders className="w-6 h-6 text-sky-400 mx-auto mb-1" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Global Template Settings</h3>
          <p className="text-xs text-slate-500 mt-0.5">Configure sender details, template frame, and merge tags.</p>
        </div>

        {/* Sender Identity Card */}
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-sky-400" /> Sender Identity (From Header)
          </span>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
              Sender Name (From Name)
            </label>
            <input
              type="text"
              value={template.senderName || 'Emailer SaaS'}
              onChange={(e) => onUpdateTemplate({ ...template, senderName: e.target.value })}
              placeholder="e.g. ChatRadix Team"
              className="glass-input w-full text-xs py-1.5 font-medium text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
              Sender Email (From Address)
            </label>
            <input
              type="text"
              value={template.senderEmail || 'info@mailtrap.co'}
              onChange={(e) => onUpdateTemplate({ ...template, senderEmail: e.target.value })}
              placeholder="e.g. support@chatradix.com"
              className="glass-input w-full text-xs py-1.5 font-mono text-slate-300"
            />
          </div>
        </div>

        {/* Template Outer Frame Padding Card */}
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-sky-400" /> Template Outer Frame Padding
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onUpdateTemplate({ ...template, contentPadding: 0 })}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                (template.contentPadding ?? 0) === 0
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Zero Frame (0px)
            </button>
            <button
              type="button"
              onClick={() => onUpdateTemplate({ ...template, contentPadding: 20 })}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                (template.contentPadding ?? 0) > 0
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🖼️ Card Frame (20px)
            </button>
          </div>
        </div>

        {/* Sidebar Merge Tags Card */}
        {renderMergeTagsCard()}
      </div>
    );
  }

  const s = selectedBlock.styles;
  const p = selectedBlock.properties;

  const updateStyle = (key: string, value: any) => {
    onUpdateBlock({
      ...selectedBlock,
      styles: { ...selectedBlock.styles, [key]: value },
    });
  };

  const updateProperty = (key: string, value: any) => {
    onUpdateBlock({
      ...selectedBlock,
      properties: { ...selectedBlock.properties, [key]: value },
    });
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          callback(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Social Link List Helpers
  const currentSocialLinks: SocialLink[] = p.socialLinks || [
    { platform: 'facebook', url: 'https://facebook.com', iconUrl: getSocialDefaultIcon('facebook') },
    { platform: 'twitter', url: 'https://twitter.com', iconUrl: getSocialDefaultIcon('twitter') },
    { platform: 'instagram', url: 'https://instagram.com', iconUrl: getSocialDefaultIcon('instagram') },
  ];

  const updateSocialLink = (index: number, updatedItem: Partial<SocialLink>) => {
    const newLinks = [...currentSocialLinks];
    newLinks[index] = { ...newLinks[index], ...updatedItem };
    updateProperty('socialLinks', newLinks);
  };

  const addSocialLink = () => {
    const newLinks: SocialLink[] = [
      ...currentSocialLinks,
      { platform: 'website', url: 'https://example.com', iconUrl: getSocialDefaultIcon('website') },
    ];
    updateProperty('socialLinks', newLinks);
  };

  const removeSocialLink = (index: number) => {
    const newLinks = currentSocialLinks.filter((_, i) => i !== index);
    updateProperty('socialLinks', newLinks);
  };

  return (
    <div className="w-80 bg-slate-900/90 border-l border-slate-800 p-5 flex flex-col shrink-0 overflow-y-auto space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{selectedBlock.type} Properties</h3>
          <p className="text-[11px] text-slate-500 font-mono">ID: {selectedBlock.id.substring(0, 8)}</p>
        </div>
        <button
          onClick={() => onDeleteBlock(selectedBlock.id)}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
          title="Delete Block"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content Editor */}
      {['header', 'text', 'button'].includes(selectedBlock.type) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase text-slate-400">Block Content</label>
            <MergeTagDropdown onInsertTag={handleInsertMergeTag} />
          </div>
          <textarea
            rows={selectedBlock.type === 'text' ? 4 : 2}
            value={selectedBlock.content}
            onChange={(e) => onUpdateBlock({ ...selectedBlock, content: e.target.value })}
            className="glass-input w-full font-sans text-xs"
          />
        </div>
      )}

      {/* Image Block Properties with Upload Option */}
      {selectedBlock.type === 'image' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase text-slate-400">Image Source</label>
              <label className="text-[11px] text-sky-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                <Upload className="w-3 h-3" /> Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileUpload(e, (url) => updateProperty('imageUrl', url))}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={p.imageUrl || ''}
              onChange={(e) => updateProperty('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="glass-input w-full text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Alt Text</label>
            <input
              type="text"
              value={p.altText || ''}
              onChange={(e) => updateProperty('altText', e.target.value)}
              placeholder="Descriptive text"
              className="glass-input w-full text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Link URL (Optional)</label>
            <input
              type="text"
              value={p.url || ''}
              onChange={(e) => updateProperty('url', e.target.value)}
              placeholder="https://userdomain.com"
              className="glass-input w-full text-xs"
            />
          </div>

          {/* Image Padding & Frame Presets */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase">Image Frame / Outer Padding</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  updateStyle('paddingTop', 0);
                  updateStyle('paddingBottom', 0);
                  updateStyle('paddingLeft', 0);
                  updateStyle('paddingRight', 0);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  (s.paddingTop ?? 0) === 0 && (s.paddingLeft ?? 0) === 0
                    ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Full Width (0 Padding)
              </button>
              <button
                type="button"
                onClick={() => {
                  updateStyle('paddingTop', 15);
                  updateStyle('paddingBottom', 15);
                  updateStyle('paddingLeft', 20);
                  updateStyle('paddingRight', 20);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  (s.paddingTop ?? 0) > 0 || (s.paddingLeft ?? 0) > 0
                    ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🖼️ Padded Frame
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Links Panel (Add / Remove / Custom Icon Upload) */}
      {selectedBlock.type === 'social' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-300">Social Networks</span>
            <button
              onClick={addSocialLink}
              className="btn-secondary py-1 px-2.5 text-[11px] flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-sky-400" /> Add Link
            </button>
          </div>

          <div className="space-y-3">
            {currentSocialLinks.map((link, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 relative group">
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) => {
                      const newPlatform = e.target.value as SocialLink['platform'];
                      updateSocialLink(idx, {
                        platform: newPlatform,
                        iconUrl: getSocialDefaultIcon(newPlatform),
                      });
                    }}
                    className="glass-input text-xs font-semibold py-1 uppercase"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube">YouTube</option>
                    <option value="website">Website / Link</option>
                    <option value="custom">Custom Icon</option>
                  </select>

                  <button
                    onClick={() => removeSocialLink(idx)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded"
                    title="Remove Link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Target URL */}
                <div>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateSocialLink(idx, { url: e.target.value })}
                    placeholder="https://..."
                    className="glass-input w-full text-xs font-mono"
                  />
                </div>

                {/* Icon Image URL & File Upload */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Icon Image URL</span>
                    <label className="text-sky-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                      <Upload className="w-3 h-3" /> Upload Icon
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageFileUpload(e, (uploadedUrl) => updateSocialLink(idx, { iconUrl: uploadedUrl }))
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <img
                      src={link.iconUrl || getSocialDefaultIcon(link.platform)}
                      alt="Icon Preview"
                      className="w-6 h-6 object-contain rounded bg-slate-900 border border-slate-800 p-0.5"
                    />
                    <input
                      type="text"
                      value={link.iconUrl || ''}
                      onChange={(e) => updateSocialLink(idx, { iconUrl: e.target.value })}
                      placeholder="Icon URL"
                      className="glass-input w-full text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Button URL */}
      {selectedBlock.type === 'button' && (
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Link URL</label>
          <input
            type="text"
            value={p.url || ''}
            onChange={(e) => updateProperty('url', e.target.value)}
            placeholder="https://userdomain.com/cta"
            className="glass-input w-full text-xs"
          />
        </div>
      )}

      {/* 2 Column Content */}
      {selectedBlock.type === 'columns_2' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Column Contents</span>
            <MergeTagDropdown onInsertTag={handleInsertMergeTag} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Column 1 Text</label>
            <textarea
              rows={2}
              value={p.column1Content || ''}
              onChange={(e) => updateProperty('column1Content', e.target.value)}
              className="glass-input w-full text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Column 2 Text</label>
            <textarea
              rows={2}
              value={p.column2Content || ''}
              onChange={(e) => updateProperty('column2Content', e.target.value)}
              className="glass-input w-full text-xs"
            />
          </div>
        </div>
      )}

      {/* Alignment Control */}
      {['header', 'text', 'button', 'image', 'social'].includes(selectedBlock.type) && (
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Text Alignment</label>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => updateStyle('textAlign', align)}
                className={`flex-1 py-1.5 border rounded-lg flex items-center justify-center transition-all ${
                  s.textAlign === align
                    ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {align === 'left' && <AlignLeft className="w-4 h-4" />}
                {align === 'center' && <AlignCenter className="w-4 h-4" />}
                {align === 'right' && <AlignRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Typography Controls */}
      {['header', 'text', 'button'].includes(selectedBlock.type) && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Font Size</label>
              <input
                type="text"
                value={s.fontSize || '16px'}
                onChange={(e) => updateStyle('fontSize', e.target.value)}
                className="glass-input w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={s.color || '#1e293b'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-800 bg-slate-950 cursor-pointer"
                />
                <input
                  type="text"
                  value={s.color || '#1e293b'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="glass-input w-full font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Merge Tags Card */}
      <div className="pt-4 border-t border-slate-800">
        {renderMergeTagsCard()}
      </div>
    </div>
  );
}
