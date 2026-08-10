import { MapPin } from 'lucide-react';

// Room numbers and floor assignments sourced from the department's own
// IAB self-assessment floor plans ("Layout-Architecture.pdf", ss6.40/6.80 —
// Department Of Architecture, SU, 146, Mohakhali, Dhaka). University-wide
// offices are shared across departments and not re-documented per floor
// plan, so that list is maintained here directly.
type OfficeRow = { name: string; level: string };

const DEPARTMENT_OFFICES: OfficeRow[] = [
  { name: 'Student Admission Room', level: '3rd Floor' },
  { name: 'Staff Room (Room 407)', level: '3rd Floor' },
  { name: 'Computer Lab (Room 411)', level: '3rd Floor' },
  { name: 'Common Room & Female Prayer Space', level: '3rd Floor' },
  { name: "Student's Lounge & Indoor Games", level: '3rd Floor' },
  { name: 'Office of the Head, Department of Architecture', level: '4th Floor' },
  { name: 'Faculty Workstation (Room 502)', level: '4th Floor' },
  { name: "Teacher's Room (Room 503)", level: '4th Floor' },
  { name: 'Architecture Studio 1 (Room 501)', level: '4th Floor' },
  { name: 'Architecture Studio 2 (Room 504)', level: '4th Floor' },
  { name: 'Architecture Studio 3 (Room 505)', level: '4th Floor' },
  { name: 'Architecture Studio 4 (Room 506)', level: '4th Floor' },
  { name: 'Architecture Studio 5 (Room 507)', level: '4th Floor' },
  { name: 'Architecture Studio 6 (Room 508)', level: '4th Floor' },
  { name: 'Jury & Exhibition Space', level: '4th Floor' },
  { name: 'Lecture Room 1 (Room 601)', level: '5th Floor' },
  { name: 'Lecture Room 2 (Room 602)', level: '5th Floor' },
  { name: 'Architecture Studio 7 (Room 603)', level: '5th Floor' },
  { name: 'Architecture Studio 8 (Room 604)', level: '5th Floor' },
  { name: 'Library (Room 608)', level: '5th Floor' },
];

const UNIVERSITY_OFFICES: OfficeRow[] = [
  { name: 'Office of the Vice Chancellor', level: 'Level 01' },
  { name: 'Office of the Pro-Vice Chancellor', level: 'Level 01' },
  { name: 'Office of the Treasurer', level: 'Level 04' },
  { name: 'Office of the Dean, Academic Affairs', level: 'Level 02' },
  { name: 'Office of the Registrar', level: 'Level 01' },
  { name: 'Office of the Controller of Examinations', level: 'Level 01' },
  { name: 'Office Of the Library', level: 'Level 01' },
  { name: 'Office of the Accounts', level: 'Level 02' },
  { name: 'Admission Office', level: 'Level 01' },
  { name: 'Waiver and Scholarship', level: 'Level 02' },
  { name: 'Card Office', level: 'Level 02' },
  { name: 'Office of the Safety & Security', level: 'Level 01' },
  { name: 'Office of CC Control room (Lost & Found)', level: 'Level 01' },
];

function GroupHeader({ label }: { label: string }) {
  return (
    <tr className="bg-accent/5">
      <td colSpan={2} className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
        {label}
      </td>
    </tr>
  );
}

function OfficeRows({ rows }: { rows: OfficeRow[] }) {
  return (
    <>
      {rows.map((row) => (
        <tr key={row.name} className="border-b border-gray-50 last:border-0 hover:bg-accent/5 transition-colors">
          <td className="px-5 py-3.5 text-sm font-semibold text-primary">{row.name}</td>
          <td className="px-5 py-3.5 text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
              <MapPin size={12} />
              {row.level}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function OfficeDirectory({ address }: { address: string }) {
  return (
    <section className="mb-14 md:mb-16">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight">
          Where to Find Each Office
        </h2>
        <div className="mt-3 mx-auto h-1 w-16 bg-accent rounded-full" />
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <MapPin size={15} className="text-accent shrink-0" />
          {address}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-left bg-gray-50/60">
              <th className="px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase text-gray-500">Office</th>
              <th className="px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase text-gray-500 text-right">Level</th>
            </tr>
          </thead>
          <tbody>
            <GroupHeader label="This Department" />
            <OfficeRows rows={DEPARTMENT_OFFICES} />
            <GroupHeader label="University Offices" />
            <OfficeRows rows={UNIVERSITY_OFFICES} />
          </tbody>
        </table>
      </div>
    </section>
  );
}
