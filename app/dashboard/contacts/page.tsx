import { Users, Plus, Upload } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-400" /> Audiences & Contacts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage subscriber lists, segments, custom tags, and suppression lists.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button className="btn-primary">
            <Plus className="w-4 h-4" /> Create List
          </button>
        </div>
      </div>

      <div className="glass-panel p-8 text-center text-slate-400">
        <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Subscriber Lists Active</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Multi-tenant contact lists are synchronized with your organization. Connect your signup forms or import subscribers.
        </p>
      </div>
    </div>
  );
}
