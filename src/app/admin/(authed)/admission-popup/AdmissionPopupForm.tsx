'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import type { AdmissionPopupSettings } from '@prisma/client';
import {
  updateAdmissionPopupSettingsAction,
  type ActionResult,
} from '@/lib/admin-actions/admission-popup';

type State = ActionResult | { ok: null };

export default function AdmissionPopupForm({ initial }: { initial: AdmissionPopupSettings | null }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    updateAdmissionPopupSettingsAction,
    { ok: null },
  );

  useEffect(() => {
    if (state.ok === true) toast.success('Popup settings saved');
    if (state.ok === false) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <Card title="Visibility">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={initial?.enabled ?? true}
            className="rounded border-gray-300 text-accent focus:ring-accent"
          />
          Show the popup on the homepage
        </label>
        <TextField
          label="Delay before showing (seconds)"
          name="delaySeconds"
          type="number"
          required
          min={1}
          max={120}
          defaultValue={String(initial?.delaySeconds ?? 15)}
        />
      </Card>

      <Card title="Copy">
        <TextField
          label="Heading"
          name="heading"
          required
          defaultValue={initial?.heading ?? 'Start your journey with Sonargaon University'}
        />
        <TextField
          label="Subheading"
          name="subheading"
          defaultValue={initial?.subheading ?? ''}
          placeholder="Optional — appears under the heading"
        />
        <TextField
          label="Button label"
          name="buttonLabel"
          required
          defaultValue={initial?.buttonLabel ?? 'Get admission guidance'}
        />
        <TextField
          label="Footer note"
          name="footerNote"
          defaultValue={initial?.footerNote ?? ''}
          placeholder="Optional — small text under the button, and shown after a successful submit"
        />
      </Card>

      {state.ok === false && (
        <div
          role="alert"
          className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
        >
          {state.error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-5 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">{title}</h2>
      {children}
    </section>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  type = 'text',
  min,
  max,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
      />
    </div>
  );
}
