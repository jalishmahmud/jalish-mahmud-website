"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";
import { contactSchema, contactErrors, inquiryTypes, inquiryFields } from "@/lib/contact-validation";
import profile from "@/data/hero.json";
import styles from "./Contact.module.css";

const initialForm = () => ({ inquiryType: "business", name: "", email: "", message: "", website: "" });

export default function ContactForm({ quick = false }) {
  const id = useId();
  const formRef = useRef(null);
  const submitting = useRef(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setStatus("");
  };

  function showErrors(next) {
    setErrors(next);
    const name = Object.keys(next)[0];
    formRef.current?.elements.namedItem(name)?.focus?.();
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    setFailure("");
    setStatus("");
    const parsed = contactSchema.safeParse({ ...form, source: quick ? "quick" : "full" });
    if (!parsed.success) { showErrors(contactErrors(parsed.error)); return; }
    submitting.current = true;
    setBusy(true);
    setErrors({});
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 400 && result.fields) showErrors(result.fields);
        setFailure(response.status === 429 ? "Too many attempts. Please wait a few minutes before trying again." : "Unable to send your message right now. Please try again or contact me directly by email.");
        return;
      }
      setForm(initialForm());
      setStatus("Message sent successfully! Thanks for reaching out. I’ll get back to you as soon as possible.");
    } catch {
      setFailure("Unable to send your message right now. Please try again or contact me directly by email.");
    } finally { submitting.current = false; setBusy(false); }
  }

  function field({ name, label, required = false, options, autoComplete, type = "text", maxLength = 160 }) {
    const props = { id: `${id}-${name}`, name, value: form[name] || "", required, disabled: busy, "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined, onChange: (event) => update(name, event.target.value) };
    return <div className={styles.field} key={name}>
      <label htmlFor={props.id}>{label}{required ? " *" : " (optional)"}</label>
      {options ? <select {...props}><option value="">Select an option</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input {...props} type={type} autoComplete={autoComplete} maxLength={maxLength} />}
      {errors[name] && <span className={styles.fieldError} id={`${id}-${name}-error`}>{errors[name]}</span>}
    </div>;
  }

  return <form ref={formRef} className={styles.form} onSubmit={submit} noValidate aria-busy={busy}>
    <p className={styles.hint}>Fields marked * are required.</p>
    <fieldset className={styles.inquiries} disabled={busy}>
      <legend>What would you like to discuss? *</legend>
      <div className={styles.choices}>{inquiryTypes.map(([value, label]) => <label key={value} className={styles.choice}><input type="radio" name="inquiryType" value={value} checked={form.inquiryType === value} onChange={() => { update("inquiryType", value); setErrors({}); }} /><span>{label}</span></label>)}</div>
    </fieldset>
    <div className={quick ? styles.singleColumn : styles.fields}>
      {field({ name: "name", label: "Full name", required: true, autoComplete: "name", maxLength: 100 })}
      {field({ name: "email", label: form.inquiryType === "hiring" ? "Work email" : "Email", required: true, type: "email", autoComplete: "email", maxLength: 254 })}
      {!quick && inquiryFields[form.inquiryType].map(field)}
    </div>
    <div className={styles.field}>
      <label htmlFor={`${id}-message`}>Message *</label>
      <textarea id={`${id}-message`} name="message" rows={quick ? 4 : 7} value={form.message} onChange={(event) => update("message", event.target.value)} required minLength={10} maxLength={10000} disabled={busy} aria-invalid={Boolean(errors.message)} aria-describedby={`${id}-message-help${errors.message ? ` ${id}-message-error` : ""}`} />
      <span className={styles.hint} id={`${id}-message-help`}>A little context helps. {form.message.length.toLocaleString()} / 10,000 characters.</span>
      {errors.message && <span className={styles.fieldError} id={`${id}-message-error`}>{errors.message}</span>}
    </div>
    <div className={styles.honeypot} aria-hidden="true"><label htmlFor={`${id}-website`}>Leave this field empty</label><input id={`${id}-website`} name="website" value={form.website} onChange={(event) => update("website", event.target.value)} tabIndex={-1} autoComplete="off" /></div>
    <p className={styles.hint}>Your details are used to respond to your inquiry. Please read the <Link href="/privacy-policy">Privacy Policy</Link>.</p>
    {status && <p className={styles.success} role="status">{status}</p>}
    {failure && <p className={styles.error} role="alert">{failure} <a href={`mailto:${profile.email}`}>Email me directly</a>.</p>}
    <button className={`btn btnPrimary ${styles.submit}`} type="submit" disabled={busy}>{busy ? <FaSpinner className={styles.spinner} aria-hidden="true" /> : <FaPaperPlane aria-hidden="true" />}{busy ? "Sending…" : "Send message"}</button>
  </form>;
}
