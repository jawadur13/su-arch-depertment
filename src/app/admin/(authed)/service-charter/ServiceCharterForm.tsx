'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ServiceCharter } from '@prisma/client';
import ImageUploader from '@/components/admin/ImageUploader';
import ServiceItemsEditor from '@/components/admin/ServiceItemsEditor';
import {
  createServiceCharterAction,
  updateServiceCharterAction,
  type ActionResult,
} from '@/lib/admin-actions/service-charter';

type State = ActionResult | { ok: null };

type PdfState = { url: string; publicId: string; fileName: string };

export default function ServiceCharterForm({ initial }: { initial: ServiceCharter | null }) {
  const isEdit = !!initial;
  const action = isEdit ? updateServiceCharterAction.bind(null, initial!.id) : createServiceCharterAction;
  const [state, formAction, pending] = useActionState<State, FormData>(action, { ok: null });

  const [pdf, setPdf] = useState<PdfState>({
    url:      initial?.pdfUrl ?? '',
    publicId: initial?.pdfPublicId ?? '',
    fileName: initial?.pdfFileName ?? '',
  });

  useEffect(() => {
    if (state.ok === true) toast.success(isEdit ? 'Service and charter saved' : 'Service and charter created');
    if (state.ok === false) toast.error(state.error);
  }, [state, isEdit]);

  return (
    <form action={formAction} className="space-y-6">
      <Card title="Basics">
        <TextField label="Slug" name="slug" required monospace
                   defaultValue={initial?.slug ?? ''} placeholder="citizens-charter" />
        <TextField label="Title (full)" name="title" required defaultValue={initial?.title ?? ''} />
        <TextField label="Short title (shown on card)" name="shortTitle" required defaultValue={initial?.shortTitle ?? ''} />
        <TextField label="Department" name="department" required
                   defaultValue={initial?.department ?? 'Architecture'} />
      </Card>

      <Card title="Charter PDF">
        <p className="text-xs text-gray-500 -mt-2">
          The &ldquo;Download&rdquo; button on the public card links to this PDF.
        </p>
        <ImageUploader
          kind="service-charter-pdf"
          name="pdf"
          accept="application/pdf"
          initialUrl={pdf.url}
          initialPublicId={pdf.publicId}
          initialFileType="pdf"
          initialFileName={pdf.fileName}
          onChange={(url, publicId, meta) => {
            setPdf({ url, publicId, fileName: meta?.fileName ?? '' });
          }}
        />
        <input type="hidden" name="pdfUrl" value={pdf.url} />
        <input type="hidden" name="pdfPublicId" value={pdf.publicId} />
        <input type="hidden" name="pdfFileName" value={pdf.fileName} />
      </Card>

      <Card title="Service directory">
        <p className="text-xs text-gray-500 -mt-2">
          The numbered &ldquo;who to ask, and where&rdquo; list shown on the public page above the download card.
          Mark each item&apos;s scope as Department (this department&apos;s own coordinator) or University-wide
          (a shared central office, same for every department).
        </p>
        <ServiceItemsEditor name="serviceItems" initialValue={initial?.serviceItems ?? []} />
      </Card>

      {state.ok === false && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <Link href="/admin/service-charter" className="px-4 py-2.5 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors">
          ← Back to service and charter entries
        </Link>
        <button type="submit" disabled={pending}
                className="bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-5 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/40">
          {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create charter'}
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
  label, name, defaultValue, required, placeholder, monospace,
}: { label: string; name: string; defaultValue?: string; required?: boolean; placeholder?: string; monospace?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <input id={name} name={name} type="text"
             defaultValue={defaultValue} required={required} placeholder={placeholder}
             className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent ${monospace ? 'font-mono' : ''}`} />
    </div>
  );
}
