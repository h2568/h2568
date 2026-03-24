"use client";
import { useState } from "react";
import type { ContactFormData } from "@/lib/validation";
import { siteConfig } from "@/lib/config";
interface Props { compact?: boolean; defaultLocation?: string; }
const LOCATIONS  = ["London", "Manchester", "Other"] as const;
const CREW_TYPES = [
  "Crew Boss / Site Supervisor","Scenic & Build Crew",
  "Event & Scenic Carpenters","Festival & Touring Crew",
  "Telehandler Operators","Mixed crew package",
] as const;
type Status = "idle" | "loading" | "success" | "error";
export function ContactForm({ compact = false, defaultLocation }: Props) {
  const [status, setStatus]           = useState<Status>("idle");
  const [errMsg, setErrMsg]           = useState("");
  const [form, setForm]               = useState<Partial<ContactFormData>>({
    location: defaultLocation as ContactFormData["location"] | undefined,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  function set(key: keyof ContactFormData, val: string) {
    setForm(p => ({ ...p, [key]: val }));
    setFieldErrors(p => ({ ...p, [key]: undefined }));
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading"); setErrMsg(""); setFieldErrors({});
    try {
      const res  = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { success?: boolean; error?: string; issues?: Partial<Record<keyof ContactFormData, string[]>> };
      if (!res.ok) {
        if (res.status === 422 && data.issues) {
          const fe: Partial<Record<keyof ContactFormData, string>> = {};
          for (const [k, msgs] of Object.entries(data.issues))
            if (msgs?.[0]) fe[k as keyof ContactFormData] = msgs[0];
          setFieldErrors(fe);
          setErrMsg("Please correct the errors below.");
        } else {
          setErrMsg(data.error ?? "Something went wrong. Please call us directly.");
        }
        setStatus("error"); return;
      }
      setStatus("success");
    } catch {
      setErrMsg("Network error. Please check your connection or call us directly.");
      setStatus("error");
    }
  }
  if (status === "success") return (
    <div className="text-center py-10 px-6">
      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5C400" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h3 className="font-heading font-bold text-lg mb-2">Enquiry Received</h3>
      <p className="text-sm text-muted leading-relaxed mb-6">Thank you. We'll be in touch within business hours — Harry typically replies the same working day.</p>
      <div className="flex gap-3 justify-center flex-wrap">
        <a href={`tel:${siteConfig.phone}`} className="bg-accent text-bg px-5 py-2.5 rounded font-heading font-bold text-sm">📞 Call Now</a>
        <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="border border-border text-white px-5 py-2.5 rounded font-heading font-semibold text-sm">💬 WhatsApp</a>
      </div>
    </div>
  );
  return (
    <form onSubmit={handleSubmit} noValidate>
      {status === "error" && errMsg && (
        <div role="alert" className="bg-red-500/10 border border-red-500/30 rounded p-3 mb-5 text-sm text-red-400">{errMsg}</div>
      )}
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Field label="Full Name" required error={fieldErrors.full_name}>
            <input className={inp(fieldErrors.full_name)} type="text" placeholder="Jane Smith" value={form.full_name ?? ""} onChange={e => set("full_name", e.target.value)} />
          </Field>
          <Field label="Company" required error={fieldErrors.company}>
            <input className={inp(fieldErrors.company)} type="text" placeholder="Production Co." value={form.company ?? ""} onChange={e => set("company", e.target.value)} />
          </Field>
          <Field label="Phone" required error={fieldErrors.phone}>
            <input className={inp(fieldErrors.phone)} type="tel" placeholder="+44 7700 000000" value={form.phone ?? ""} onChange={e => set("phone", e.target.value)} />
          </Field>
          <Field label="Email" required error={fieldErrors.email}>
            <input className={inp(fieldErrors.email)} type="email" placeholder="jane@example.com" value={form.email ?? ""} onChange={e => set("email", e.target.value)} />
          </Field>
        </div>
      )}
      <div className={`grid gap-3 mb-3 ${compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
        <Field label="Location" required error={fieldErrors.location}>
          <select className={inp(fieldErrors.location)} value={form.location ?? ""} onChange={e => set("location", e.target.value)}>
            <option value="">Select location</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Crew Type" required error={fieldErrors.crew_type}>
          <select className={inp(fieldErrors.crew_type)} value={form.crew_type ?? ""} onChange={e => set("crew_type", e.target.value)}>
            <option value="">Select crew type</option>
            {CREW_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Event Dates" required error={fieldErrors.event_dates}>
          <input className={inp(fieldErrors.event_dates)} type="text" placeholder="e.g. 14–16 June 2025" value={form.event_dates ?? ""} onChange={e => set("event_dates", e.target.value)} />
        </Field>
      </div>
      {!compact && (
        <Field label="Additional Information" error={fieldErrors.message} className="mb-3">
          <textarea className={`${inp(fieldErrors.message)} resize-y min-h-[90px]`} placeholder="Crew numbers, event type, site conditions…" value={form.message ?? ""} onChange={e => set("message", e.target.value)} />
        </Field>
      )}
      <noscript>
        <p className="text-sm text-muted mb-3 p-3 border border-border rounded">
          Please call <a href={`tel:${siteConfig.phone}`} className="text-accent font-semibold">{siteConfig.phoneDisplay}</a> or email <a href={`mailto:${siteConfig.email}`} className="text-accent font-semibold">{siteConfig.email}</a>.
        </p>
      </noscript>
      <button type="submit" disabled={status === "loading"}
        className="w-full bg-accent text-bg py-3 rounded font-heading font-bold text-sm hover:opacity-88 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
        {status === "loading" ? <><Spinner /> Sending…</> : "Check Crew Availability →"}
      </button>
      <p className="text-center text-xs text-muted/40 mt-2">Response within business hours, Mon–Fri. No obligation.</p>
    </form>
  );
}
function Field({ label, required, error, children, className = "" }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400" role="alert">{error}</p>}
    </div>
  );
}
function inp(error?: string) {
  return `w-full bg-bg border ${error ? "border-red-500/60" : "border-border"} rounded-md px-3 py-2.5 text-sm text-white placeholder-muted/30 outline-none focus:border-accent/60 transition-colors appearance-none`;
}
function Spinner() {
  return (
    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}
