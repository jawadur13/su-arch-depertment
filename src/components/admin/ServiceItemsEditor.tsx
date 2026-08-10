'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import FormSortableList from './FormSortableList';

// Structured editor for ServiceCharter.serviceItems Json — the public
// "who to ask, and where" directory: item -> steps[] + a contact block.
// Mirrors SemestersEditor.tsx's pattern (local id-keyed state for
// stable keys, serialize on submit via a hidden input).

type Step = { id: string; text: string; linkLabel: string; linkHref: string };
type Item = {
  id: string;
  title: string;
  scope: 'department' | 'university';
  steps: Step[];
  contactName: string;
  contactRole: string;
  contactPhone: string;
  contactEmail: string;
  contactRoom: string;
};

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

function normalize(initial: unknown): Item[] {
  if (!Array.isArray(initial)) return [];
  return initial
    .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
    .map((r) => ({
      id:           genId('item'),
      title:        typeof r.title === 'string' ? r.title : '',
      scope:        r.scope === 'university' ? 'university' : 'department',
      contactName:  typeof r.contactName === 'string' ? r.contactName : '',
      contactRole:  typeof r.contactRole === 'string' ? r.contactRole : '',
      contactPhone: typeof r.contactPhone === 'string' ? r.contactPhone : '',
      contactEmail: typeof r.contactEmail === 'string' ? r.contactEmail : '',
      contactRoom:  typeof r.contactRoom === 'string' ? r.contactRoom : '',
      steps: Array.isArray(r.steps)
        ? (r.steps as unknown[])
            .filter((s): s is Record<string, unknown> => typeof s === 'object' && s !== null)
            .map((s) => ({
              id:        genId('step'),
              text:      typeof s.text === 'string' ? s.text : '',
              linkLabel: typeof s.linkLabel === 'string' ? s.linkLabel : '',
              linkHref:  typeof s.linkHref === 'string' ? s.linkHref : '',
            }))
        : [],
    }));
}

type Props = {
  name: string;
  initialValue: unknown;
};

export default function ServiceItemsEditor({ name, initialValue }: Props) {
  const [items, setItems] = useState<Item[]>(() => normalize(initialValue));

  function addItem() {
    setItems([...items, {
      id: genId('item'), title: '', scope: 'department', steps: [],
      contactName: '', contactRole: '', contactPhone: '', contactEmail: '', contactRoom: '',
    }]);
  }
  function removeItem(itemId: string) {
    setItems(items.filter((it) => it.id !== itemId));
  }
  function updateItem(itemId: string, field: keyof Item, val: string) {
    setItems(items.map((it) => (it.id === itemId ? { ...it, [field]: val } : it)));
  }
  function reorderItems(orderedIds: string[]) {
    setItems(orderedIds.map((id) => items.find((it) => it.id === id)!));
  }

  function addStep(itemId: string) {
    setItems(items.map((it) => it.id === itemId
      ? { ...it, steps: [...it.steps, { id: genId('step'), text: '', linkLabel: '', linkHref: '' }] }
      : it));
  }
  function removeStep(itemId: string, stepId: string) {
    setItems(items.map((it) => it.id === itemId
      ? { ...it, steps: it.steps.filter((s) => s.id !== stepId) }
      : it));
  }
  function updateStep(itemId: string, stepId: string, field: 'text' | 'linkLabel' | 'linkHref', val: string) {
    setItems(items.map((it) => it.id === itemId
      ? { ...it, steps: it.steps.map((s) => (s.id === stepId ? { ...s, [field]: val } : s)) }
      : it));
  }
  function reorderSteps(itemId: string, orderedIds: string[]) {
    setItems(items.map((it) => {
      if (it.id !== itemId) return it;
      return { ...it, steps: orderedIds.map((id) => it.steps.find((s) => s.id === id)!) };
    }));
  }

  const serializable = items.map((it) => ({
    title: it.title,
    scope: it.scope,
    steps: it.steps.map((s) => ({
      text:      s.text,
      linkLabel: s.linkLabel || null,
      linkHref:  s.linkHref || null,
    })),
    contactName:  it.contactName || null,
    contactRole:  it.contactRole || null,
    contactPhone: it.contactPhone || null,
    contactEmail: it.contactEmail || null,
    contactRoom:  it.contactRoom || null,
  }));

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-xs text-gray-500 italic">No service items yet.</p>
      )}
      <FormSortableList
        items={items}
        getId={(it) => it.id}
        onReorder={reorderItems}
        renderItem={(item) => (
          <ItemCard
            index={items.findIndex((it) => it.id === item.id)}
            item={item}
            onUpdate={(field, val) => updateItem(item.id, field, val)}
            onRemove={() => removeItem(item.id)}
            onAddStep={() => addStep(item.id)}
            onRemoveStep={(sid) => removeStep(item.id, sid)}
            onUpdateStep={(sid, field, val) => updateStep(item.id, sid, field, val)}
            onReorderSteps={(ids) => reorderSteps(item.id, ids)}
          />
        )}
      />
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
      >
        <Plus size={14} /> Add service item
      </button>
      <input type="hidden" name={name} value={JSON.stringify(serializable)} />
    </div>
  );
}

function ItemCard({
  index, item, onUpdate, onRemove, onAddStep, onRemoveStep, onUpdateStep, onReorderSteps,
}: {
  index: number;
  item: Item;
  onUpdate: (field: keyof Item, val: string) => void;
  onRemove: () => void;
  onAddStep: () => void;
  onRemoveStep: (stepId: string) => void;
  onUpdateStep: (stepId: string, field: 'text' | 'linkLabel' | 'linkHref', val: string) => void;
  onReorderSteps: (orderedIds: string[]) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
          Item {index + 1}
        </h4>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove item"
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-2">
        <Input label="Title" value={item.title}
               onChange={(v) => onUpdate('title', v)} placeholder="Course Offering" />
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">Scope</label>
          <select
            value={item.scope}
            onChange={(e) => onUpdate('scope', e.target.value)}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          >
            <option value="department">Department</option>
            <option value="university">University-wide</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5 bg-gray-50/60 border border-gray-200 rounded p-3">
        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Steps</h5>
        {item.steps.length === 0 && (
          <p className="text-xs text-gray-500 italic">No steps yet.</p>
        )}
        <FormSortableList
          items={item.steps}
          getId={(s) => s.id}
          onReorder={onReorderSteps}
          renderItem={(step) => (
            <div className="bg-white border border-gray-200 rounded grid grid-cols-1 md:grid-cols-[1fr_140px_1fr_auto] gap-1.5 p-2 items-end">
              <Input label="Step text" value={step.text}
                     onChange={(v) => onUpdateStep(step.id, 'text', v)}
                     placeholder="Contact the Department Office" />
              <Input label="Link label (optional)" value={step.linkLabel}
                     onChange={(v) => onUpdateStep(step.id, 'linkLabel', v)}
                     placeholder="Program page" />
              <Input label="Link URL (optional)" value={step.linkHref}
                     onChange={(v) => onUpdateStep(step.id, 'linkHref', v)}
                     placeholder="/admission/programs/b-arch" />
              <button
                type="button"
                onClick={() => onRemoveStep(step.id)}
                aria-label="Remove step"
                className="self-end p-1.5 mb-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        />
        <button
          type="button"
          onClick={onAddStep}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
        >
          <Plus size={12} /> Add step
        </button>
      </div>

      <div className="space-y-1.5 bg-gray-50/60 border border-gray-200 rounded p-3">
        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Contact</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input label="Name" value={item.contactName}
                 onChange={(v) => onUpdate('contactName', v)} placeholder="Nilufar Yeasmin Neela" />
          <Input label="Role" value={item.contactRole}
                 onChange={(v) => onUpdate('contactRole', v)} placeholder="Lecturer and Coordinator" />
          <Input label="Phone" value={item.contactPhone}
                 onChange={(v) => onUpdate('contactPhone', v)} placeholder="01712844542" />
          <Input label="Email" value={item.contactEmail}
                 onChange={(v) => onUpdate('contactEmail', v)} placeholder="neela.barch@su.edu.bd" />
          <Input label="Room (leave blank if unconfirmed)" value={item.contactRoom}
                 onChange={(v) => onUpdate('contactRoom', v)} placeholder="Room 504" />
        </div>
      </div>
    </div>
  );
}

function Input({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
      />
    </div>
  );
}
