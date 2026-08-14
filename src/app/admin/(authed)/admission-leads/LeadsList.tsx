'use client';

import { useRouter } from 'next/navigation';
import { Trash2, Phone, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminListItems } from '@/lib/hooks/useAdminListItems';
import { useConfirm } from '@/components/admin/ConfirmDialogProvider';
import { deleteAdmissionLeadAction } from '@/lib/admin-actions/admission-leads';

type LeadRow = {
  id: string;
  fullName: string;
  mobile: string;
  programName: string;
  // ISO string — Server Component serializes Date for the client boundary.
  createdAt: string;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LeadsList({ items: initialItems }: { items: LeadRow[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const { items, removeById } = useAdminListItems(initialItems);

  async function handleDelete(id: string, fullName: string) {
    const ok = await confirm({
      title: 'Delete lead?',
      message: `"${fullName}" will be removed permanently. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    const res = await deleteAdmissionLeadAction(id);
    if (res.ok) {
      removeById(id);
      toast.success('Lead deleted');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-lg">
        <GraduationCap size={24} className="text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No leads yet.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((lead) => (
        <li
          key={lead.id}
          className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{lead.fullName}</div>
            <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
              <a
                href={`tel:${lead.mobile}`}
                className="inline-flex items-center gap-1 hover:text-accent transition-colors"
              >
                <Phone size={12} />
                {lead.mobile}
              </a>
              <span className="inline-flex items-center gap-1">
                <GraduationCap size={12} />
                {lead.programName}
              </span>
              <span>{formatDate(lead.createdAt)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(lead.id, lead.fullName)}
            aria-label={`Delete ${lead.fullName}`}
            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}
