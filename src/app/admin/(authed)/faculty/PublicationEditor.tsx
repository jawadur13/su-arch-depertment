'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

type Entry = { text: string; link: string };

// Accepts the new { text, link }[] shape, and best-effort flattens the
// legacy string / string[] / { heading, items }[] shapes so older data
// still loads into the editor (with no link, since none of those shapes
// had one).
function normalize(v: unknown): Entry[] {
  if (v == null) return [];
  if (typeof v === 'string') return [{ text: v, link: '' }];
  if (Array.isArray(v)) {
    if (v.length === 0) return [];
    if (typeof v[0] === 'string') {
      return (v as string[]).map((text) => ({ text, link: '' }));
    }
    if (typeof v[0] === 'object' && v[0] !== null && 'text' in (v[0] as object)) {
      return (v as Array<{ text?: unknown; link?: unknown }>).map((p) => ({
        text: typeof p.text === 'string' ? p.text : '',
        link: typeof p.link === 'string' ? p.link : '',
      }));
    }
    return (v as Array<{ heading?: unknown; items?: unknown }>).flatMap((g) =>
      Array.isArray(g.items)
        ? g.items.filter((i): i is string => typeof i === 'string').map((text) => ({ text, link: '' }))
        : [],
    );
  }
  return [];
}

function serialize(entries: Entry[]): { text: string; link?: string }[] | null {
  const cleaned = entries
    .map((e) => ({ text: e.text.trim(), link: e.link.trim() }))
    .filter((e) => e.text.length > 0)
    .map((e) => (e.link.length > 0 ? e : { text: e.text }));
  return cleaned.length > 0 ? cleaned : null;
}

type Props = {
  name: string;
  label: string;
  initialValue: unknown;
};

export default function PublicationEditor({ name, label, initialValue }: Props) {
  const [entries, setEntries] = useState<Entry[]>(normalize(initialValue));

  function addEntry() {
    setEntries([...entries, { text: '', link: '' }]);
  }
  function removeEntry(i: number) {
    setEntries(entries.filter((_, idx) => idx !== i));
  }
  function updateText(i: number, value: string) {
    setEntries(entries.map((e, idx) => (idx === i ? { ...e, text: value } : e)));
  }
  function updateLink(i: number, value: string) {
    setEntries(entries.map((e, idx) => (idx === i ? { ...e, link: value } : e)));
  }

  const serialized = serialize(entries);

  return (
    <div className="space-y-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {entries.length === 0 && (
        <p className="text-xs text-gray-400 italic">No content.</p>
      )}

      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50/30">
            <div className="flex items-start gap-2">
              <textarea
                value={entry.text}
                onChange={(e) => updateText(i, e.target.value)}
                rows={2}
                placeholder="Publication citation text"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-y bg-white"
              />
              <button
                type="button"
                onClick={() => removeEntry(i)}
                aria-label="Remove publication"
                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors mt-1"
              >
                <X size={14} />
              </button>
            </div>
            <input
              type="url"
              value={entry.link}
              onChange={(e) => updateLink(i, e.target.value)}
              placeholder="Link (optional) — e.g. https://doi.org/..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-white"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
      >
        <Plus size={14} /> Add publication
      </button>

      <input
        type="hidden"
        name={name}
        value={serialized === null ? '' : JSON.stringify(serialized)}
      />
    </div>
  );
}
