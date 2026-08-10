'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import FormSortableList from './FormSortableList';

// Structured editor for ProgramCurriculum.semesters Json — two levels:
//   Semester (yearLabel, semesterLabel, totalContactHours)
//     └─ courses []
//          └─ Course (code, title, credits, elective)
//
// Mirrors ShiftsEditor.tsx's pattern (local id-keyed state for stable
// React keys + drag identity, serialize on submit via a hidden input).

type Course = {
  id: string;
  code: string;
  title: string;
  credits: string;
  elective: boolean;
};
type Semester = {
  id: string;
  yearLabel: string;
  semesterLabel: string;
  totalContactHours: string;
  electiveCreditsRequired: string;
  courses: Course[];
};

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

function normalize(initial: unknown): Semester[] {
  if (!Array.isArray(initial)) return [];
  return initial
    .filter((s): s is Record<string, unknown> => typeof s === 'object' && s !== null)
    .map((s) => ({
      id:                 genId('sem'),
      yearLabel:          typeof s.yearLabel === 'string' ? s.yearLabel : '',
      semesterLabel:      typeof s.semesterLabel === 'string' ? s.semesterLabel : '',
      totalContactHours:  typeof s.totalContactHours === 'string' ? s.totalContactHours : '',
      electiveCreditsRequired: typeof s.electiveCreditsRequired === 'number' ? String(s.electiveCreditsRequired) : '0',
      courses: Array.isArray(s.courses)
        ? (s.courses as unknown[])
            .filter((c): c is Record<string, unknown> => typeof c === 'object' && c !== null)
            .map((c) => ({
              id:       genId('co'),
              code:     typeof c.code === 'string' ? c.code : '',
              title:    typeof c.title === 'string' ? c.title : '',
              credits:  typeof c.credits === 'number' ? String(c.credits) : (typeof c.credits === 'string' ? c.credits : ''),
              elective: c.elective === true,
            }))
        : [],
    }));
}

type Props = {
  name: string;
  initialValue: unknown;
};

export default function SemestersEditor({ name, initialValue }: Props) {
  const [semesters, setSemesters] = useState<Semester[]>(() => normalize(initialValue));

  function addSemester() {
    setSemesters([...semesters, {
      id: genId('sem'), yearLabel: '', semesterLabel: '', totalContactHours: '', electiveCreditsRequired: '0', courses: [],
    }]);
  }
  function removeSemester(semId: string) {
    setSemesters(semesters.filter((s) => s.id !== semId));
  }
  function updateSemester(semId: string, field: 'yearLabel' | 'semesterLabel' | 'totalContactHours' | 'electiveCreditsRequired', val: string) {
    setSemesters(semesters.map((s) => (s.id === semId ? { ...s, [field]: val } : s)));
  }
  function reorderSemesters(orderedIds: string[]) {
    setSemesters(orderedIds.map((id) => semesters.find((s) => s.id === id)!));
  }

  function addCourse(semId: string) {
    setSemesters(semesters.map((s) => s.id === semId
      ? { ...s, courses: [...s.courses, { id: genId('co'), code: '', title: '', credits: '', elective: false }] }
      : s));
  }
  function removeCourse(semId: string, courseId: string) {
    setSemesters(semesters.map((s) => s.id === semId
      ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) }
      : s));
  }
  function updateCourse(semId: string, courseId: string, field: 'code' | 'title' | 'credits', val: string) {
    setSemesters(semesters.map((s) => s.id === semId
      ? { ...s, courses: s.courses.map((c) => (c.id === courseId ? { ...c, [field]: val } : c)) }
      : s));
  }
  function toggleCourseElective(semId: string, courseId: string, val: boolean) {
    setSemesters(semesters.map((s) => s.id === semId
      ? { ...s, courses: s.courses.map((c) => (c.id === courseId ? { ...c, elective: val } : c)) }
      : s));
  }
  function reorderCourses(semId: string, orderedIds: string[]) {
    setSemesters(semesters.map((s) => {
      if (s.id !== semId) return s;
      return { ...s, courses: orderedIds.map((id) => s.courses.find((c) => c.id === id)!) };
    }));
  }

  const serializable = semesters.map((s) => ({
    yearLabel: s.yearLabel,
    semesterLabel: s.semesterLabel,
    totalContactHours: s.totalContactHours,
    electiveCreditsRequired: Number(s.electiveCreditsRequired) || 0,
    courses: s.courses.map((c) => ({
      code: c.code,
      title: c.title,
      credits: Number(c.credits) || 0,
      elective: c.elective,
    })),
  }));

  return (
    <div className="space-y-3">
      {semesters.length === 0 && (
        <p className="text-xs text-gray-500 italic">No semesters yet.</p>
      )}
      <FormSortableList
        items={semesters}
        getId={(s) => s.id}
        onReorder={reorderSemesters}
        renderItem={(semester) => (
          <SemesterCard
            semester={semester}
            onUpdate={(field, val) => updateSemester(semester.id, field, val)}
            onRemove={() => removeSemester(semester.id)}
            onAddCourse={() => addCourse(semester.id)}
            onRemoveCourse={(cid) => removeCourse(semester.id, cid)}
            onUpdateCourse={(cid, field, val) => updateCourse(semester.id, cid, field, val)}
            onToggleElective={(cid, val) => toggleCourseElective(semester.id, cid, val)}
            onReorderCourses={(ids) => reorderCourses(semester.id, ids)}
          />
        )}
      />
      <button
        type="button"
        onClick={addSemester}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
      >
        <Plus size={14} /> Add semester
      </button>
      <input type="hidden" name={name} value={JSON.stringify(serializable)} />
    </div>
  );
}

function SemesterCard({
  semester, onUpdate, onRemove, onAddCourse, onRemoveCourse, onUpdateCourse, onToggleElective, onReorderCourses,
}: {
  semester: Semester;
  onUpdate: (field: 'yearLabel' | 'semesterLabel' | 'totalContactHours' | 'electiveCreditsRequired', val: string) => void;
  onRemove: () => void;
  onAddCourse: () => void;
  onRemoveCourse: (courseId: string) => void;
  onUpdateCourse: (courseId: string, field: 'code' | 'title' | 'credits', val: string) => void;
  onToggleElective: (courseId: string, val: boolean) => void;
  onReorderCourses: (orderedIds: string[]) => void;
}) {
  const coreCredits = semester.courses.filter((c) => !c.elective).reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
  const electiveRequired = Number(semester.electiveCreditsRequired) || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">Semester</h4>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove semester"
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input label="Year" value={semester.yearLabel}
               onChange={(v) => onUpdate('yearLabel', v)} placeholder="1st Year" />
        <Input label="Semester" value={semester.semesterLabel}
               onChange={(v) => onUpdate('semesterLabel', v)} placeholder="1st Semester" />
        <Input label="Total contact hours" value={semester.totalContactHours}
               onChange={(v) => onUpdate('totalContactHours', v)} placeholder="22.0 hrs./week" />
      </div>

      <div className="max-w-xs">
        <Input label="Elective credits required (select-one-per-set total)" value={semester.electiveCreditsRequired}
               onChange={(v) => onUpdate('electiveCreditsRequired', v)} placeholder="5.00" inputMode="numeric" />
      </div>
      <p className="text-[11px] text-gray-500 -mt-2">
        This — not a sum of the elective rows below — drives the public page&apos;s Credit Distribution table, since every alternative in a &ldquo;select one&rdquo; set is listed below for browsing but only one is actually taken.
      </p>

      <div className="space-y-1.5 bg-gray-50/60 border border-gray-200 rounded p-3">
        <div className="flex items-center justify-between">
          <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Courses</h5>
          <span className="text-[10px] font-semibold text-gray-500">
            {coreCredits.toFixed(2)} core + {electiveRequired.toFixed(2)} elective = {(coreCredits + electiveRequired).toFixed(2)} credits
          </span>
        </div>
        {semester.courses.length === 0 && (
          <p className="text-xs text-gray-500 italic">No courses yet.</p>
        )}
        <FormSortableList
          items={semester.courses}
          getId={(c) => c.id}
          onReorder={onReorderCourses}
          renderItem={(course) => (
            <div className="bg-white border border-gray-200 rounded grid grid-cols-1 md:grid-cols-[110px_1fr_90px_auto_auto] gap-1.5 p-2 items-end">
              <Input label="Code" value={course.code}
                     onChange={(v) => onUpdateCourse(course.id, 'code', v)}
                     placeholder="Arch 1102" monospace />
              <Input label="Course title" value={course.title}
                     onChange={(v) => onUpdateCourse(course.id, 'title', v)}
                     placeholder="Design Studio I" />
              <Input label="Credits" value={course.credits} inputMode="numeric"
                     onChange={(v) => onUpdateCourse(course.id, 'credits', v)}
                     placeholder="6.00" />
              <label className="flex items-center gap-1.5 text-xs text-gray-600 pb-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={course.elective}
                  onChange={(e) => onToggleElective(course.id, e.target.checked)}
                  className="rounded border-gray-300 text-accent focus:ring-accent/40"
                />
                Elective
              </label>
              <button
                type="button"
                onClick={() => onRemoveCourse(course.id)}
                aria-label="Remove course"
                className="self-end p-1.5 mb-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        />
        <button
          type="button"
          onClick={onAddCourse}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
        >
          <Plus size={12} /> Add course
        </button>
      </div>
    </div>
  );
}

function Input({
  label, value, onChange, placeholder, inputMode, monospace,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'numeric';
  monospace?: boolean;
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
        inputMode={inputMode}
        className={`w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent ${monospace ? 'font-mono' : ''}`}
      />
    </div>
  );
}
