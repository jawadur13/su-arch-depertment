'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import type { ProgramCurriculum } from '@prisma/client';
import ImageUploader from '@/components/admin/ImageUploader';
import OverviewStatsEditor from '@/components/admin/OverviewStatsEditor';
import SemestersEditor from '@/components/admin/SemestersEditor';
import {
  upsertProgramCurriculumAction,
  deleteProgramCurriculumAction,
  type ActionResult,
} from '@/lib/admin-actions/program-curriculum';
import { useConfirm } from '@/components/admin/ConfirmDialogProvider';

type State = ActionResult | { ok: null };

type ProgramSummary = { id: string; programName: string; degreeCode: string };

type PdfState = { url: string; publicId: string; fileName: string };

export default function ProgramCurriculumForm({
  program,
  initial,
}: {
  program: ProgramSummary;
  initial: ProgramCurriculum | null;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const action = upsertProgramCurriculumAction.bind(null, program.id);
  const [state, formAction, pending] = useActionState<State, FormData>(action, { ok: null });

  const [pdf, setPdf] = useState<PdfState>({
    url:      initial?.syllabusPdfUrl ?? '',
    publicId: initial?.syllabusPdfPublicId ?? '',
    fileName: initial?.syllabusPdfFileName ?? '',
  });

  useEffect(() => {
    if (state.ok === true) toast.success(initial ? 'Curriculum saved' : 'Curriculum created');
    if (state.ok === false) toast.error(state.error);
  }, [state, initial]);

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete curriculum page?',
      message: `The curriculum detail page for "${program.programName}" will be removed and its "View More" button will fall back to the default requirements page. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    const res = await deleteProgramCurriculumAction(program.id);
    if (res.ok) {
      toast.success('Curriculum deleted');
      router.push('/admin/program-curriculum');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <Card title="Basics">
        <TextField label="Slug (URL — /admission/programs/[slug])" name="slug" required monospace
                   defaultValue={initial?.slug ?? ''} placeholder="b-arch" />
        <TextField label="Hero overline" name="heroOverline"
                   defaultValue={initial?.heroOverline ?? ''} placeholder="Undergraduate Program" />
        <TextField label="Hero title" name="heroTitle" required
                   defaultValue={initial?.heroTitle ?? program.programName}
                   placeholder="B.Arch in Architecture" />
        <NumberField label="Display order" name="displayOrder" defaultValue={initial?.displayOrder ?? 0} />
      </Card>

      <Card title="Hero image (optional)">
        <ImageUploader kind="program-curriculum-hero" name="heroImage" aspectRatio="wide"
                       initialUrl={initial?.heroImageUrl}
                       initialPublicId={initial?.heroImagePublicId} />
      </Card>

      <Card title="Intro">
        <TextField label="Intro overline pill" name="introOverline"
                   defaultValue={initial?.introOverline ?? ''} placeholder="Bachelor of Architecture (B.Arch)" />
        <TextAreaField label="Intro paragraph" name="introBody" rows={3}
                       defaultValue={initial?.introBody ?? ''} />
      </Card>

      <Card title="At a Glance stats">
        <p className="text-xs text-gray-500 -mt-2">
          Drag rows to reorder. Rendered as a card grid at the top of the page.
        </p>
        <OverviewStatsEditor name="overviewStats" initialValue={initial?.overviewStats ?? []} />
      </Card>

      <Card title="Specializations (optional)">
        <p className="text-xs text-gray-500 -mt-2">
          One per line. Omit entirely to hide the section on the public page.
        </p>
        <TextAreaField label="Specializations" name="specializations" rows={5}
                       defaultValue={(initial?.specializations ?? []).join('\n')} />
      </Card>

      <Card title="Career prospects (optional)">
        <p className="text-xs text-gray-500 -mt-2">
          Leave empty to hide the section entirely on the public page — never fabricate this copy.
        </p>
        <TextAreaField label="Career prospects" name="careerProspects" rows={6}
                       defaultValue={initial?.careerProspects ?? ''} />
      </Card>

      <Card title="Course structure (semesters)">
        <p className="text-xs text-gray-500 -mt-2">
          One card per semester. Each course row can be marked Elective; credits per semester total automatically. Credit Distribution on the public page (Core / Elective / Total / Cumulative) is computed from this data.
        </p>
        <SemestersEditor name="semesters" initialValue={initial?.semesters ?? []} />
      </Card>

      <Card title="Full syllabus PDF (optional)">
        <p className="text-xs text-gray-500 -mt-2">
          The &ldquo;Download PDF&rdquo; button on the public page links to this file.
        </p>
        <ImageUploader
          kind="program-curriculum-syllabus-pdf"
          name="syllabusPdf"
          accept="application/pdf"
          initialUrl={pdf.url}
          initialPublicId={pdf.publicId}
          initialFileType="pdf"
          initialFileName={pdf.fileName}
          onChange={(url, publicId, meta) => {
            setPdf({ url, publicId, fileName: meta?.fileName ?? '' });
          }}
        />
        <input type="hidden" name="syllabusPdfUrl" value={pdf.url} />
        <input type="hidden" name="syllabusPdfPublicId" value={pdf.publicId} />
        <input type="hidden" name="syllabusPdfFileName" value={pdf.fileName} />
      </Card>

      {state.ok === false && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </div>
      )}

      <div className="flex justify-between items-center">
        {initial ? (
          <button type="button" onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300">
            <Trash2 size={14} />
            Delete curriculum page
          </button>
        ) : <span />}
        <button type="submit" disabled={pending}
                className="bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-5 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/40">
          {pending ? 'Saving…' : initial ? 'Save changes' : 'Create curriculum page'}
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

function NumberField({
  label, name, defaultValue,
}: { label: string; name: string; defaultValue?: number }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input id={name} name={name} type="number" defaultValue={defaultValue}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
    </div>
  );
}

function TextAreaField({
  label, name, defaultValue, required, rows = 4,
}: { label: string; name: string; defaultValue?: string; required?: boolean; rows?: number }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <textarea id={name} name={name}
                defaultValue={defaultValue} required={required} rows={rows}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-y" />
    </div>
  );
}
