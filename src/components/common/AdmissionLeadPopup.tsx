'use client';

import { useEffect, useState } from 'react';
import { X as XIcon, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'admission_popup_seen';
const HONEYPOT_NAME = 'website';
const BD_MOBILE_REGEX = /^01[3-9]\d{8}$/;

type FormState = 'idle' | 'submitting' | 'submitted' | 'error';

type PopupSettings = {
  delaySeconds: number;
  heading: string;
  subheading: string | null;
  buttonLabel: string;
  footerNote: string | null;
};

type ProgramOption = { id: string; programName: string };

export default function AdmissionLeadPopup({
  settings,
  programs,
}: {
  settings: PopupSettings;
  programs: readonly ProgramOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FormState>('idle');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [programName, setProgramName] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fire once per tab session, `delaySeconds` after mount — same
  // sessionStorage try/catch idiom as InitialSplash, so a dismiss or
  // a completed submit both suppress it for the rest of the tab's
  // life without nagging on every homepage visit within the session.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    const timer = window.setTimeout(() => setOpen(true), settings.delaySeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [settings.delaySeconds]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  function markSeen() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore — private mode / quota
    }
  }

  function close() {
    setOpen(false);
    markSeen();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === 'submitting') return;

    if (!BD_MOBILE_REGEX.test(mobile.trim())) {
      setErrorMsg('Enter a valid Bangladeshi mobile number (e.g. 01712345678).');
      setState('error');
      return;
    }

    setState('submitting');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admission-leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, mobile, programName, [HONEYPOT_NAME]: honeypot }),
      });
      if (res.ok) {
        setState('submitted');
        markSeen();
        return;
      }
      let serverMessage = 'Something went wrong. Please try again.';
      try {
        const data = await res.json();
        if (typeof data?.error === 'string' && data.error.length > 0) {
          serverMessage = data.error;
        }
      } catch {
        // non-JSON response — keep generic message
      }
      setErrorMsg(serverMessage);
      setState('error');
    } catch {
      setErrorMsg('Network error — please check your connection and try again.');
      setState('error');
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admission-popup-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-black/60"
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={close}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-[1] p-1.5 rounded-full bg-black/5 text-gray-500 hover:bg-black/10 hover:text-gray-700 transition-colors"
        >
          <XIcon size={18} />
        </button>

        {state === 'submitted' ? (
          <div className="px-7 py-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h3 className="font-display text-xl font-bold text-primary mb-2">Thank you!</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {settings.footerNote ?? 'Our admission team will contact you shortly.'}
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 inline-flex items-center justify-center px-5 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-primary to-accent px-7 pt-7 pb-6 text-white">
              <h2 id="admission-popup-title" className="font-display text-xl font-bold leading-tight pr-6">
                {settings.heading}
              </h2>
              {settings.subheading && (
                <p className="mt-2 text-sm text-white/85 leading-relaxed">{settings.subheading}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4" noValidate>
              <Field label="Full name" required>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={state === 'submitting'}
                  placeholder="As written on your certificate"
                  autoComplete="name"
                  className={inputClass}
                />
              </Field>

              <Field label="Mobile number" required>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={state === 'submitting'}
                  placeholder="01XXXXXXXXX"
                  pattern="01[3-9][0-9]{8}"
                  autoComplete="tel"
                  className={inputClass}
                />
              </Field>

              <Field label="Programme you are interested in" required>
                <select
                  required
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  disabled={state === 'submitting'}
                  className={`${inputClass} bg-white`}
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                >
                  <option value="" disabled style={{ color: '#6b7280' }}>
                    Choose a programme
                  </option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.programName} style={{ color: '#111827' }}>
                      {p.programName}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Honeypot — hidden from real users + assistive tech. */}
              <div
                aria-hidden="true"
                className="absolute left-[-9999px] w-px h-px overflow-hidden opacity-0 pointer-events-none"
              >
                <label htmlFor="admission-popup-website">Website</label>
                <input
                  id="admission-popup-website"
                  type="text"
                  name={HONEYPOT_NAME}
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {state === 'error' && errorMsg && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={state === 'submitting'}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white font-semibold rounded-full shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {state === 'submitting' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  settings.buttonLabel
                )}
              </button>

              {settings.footerNote && (
                <p className="text-center text-xs text-gray-500">{settings.footerNote}</p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 focus:bg-white transition disabled:opacity-60';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 mb-1.5 text-[13px] font-semibold text-primary">
        {label}
        {required && <span className="text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}
