"use client";

import { useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCommentDots, FaTimes } from "react-icons/fa";
import baseStyles from "./Contact.module.css";
import { withDesignStyles } from "@/lib/design-styles";
const styles = withDesignStyles(baseStyles, "Contact");

const ContactForm = dynamic(() => import("./ContactForm"), { loading: () => <p role="status">Loading contact form…</p> });

export default function FloatingContact() {
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const titleId = useId();
  const pathname = usePathname();
  const privatePage = pathname === "/admin" || pathname.startsWith("/admin/");

  function keepFocusInside(event) {
    if (event.key !== "Tab") return;
    const controls = [...dialog.current.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]')]
      .filter((element) => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  useEffect(() => {
    if (!open || privatePage) return;
    const panel = dialog.current;
    const button = trigger.current;
    const previousOverflow = document.body.style.overflow;
    panel.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      panel.close();
      document.body.style.overflow = previousOverflow;
      button?.focus();
    };
  }, [open, privatePage]);

  useEffect(() => { setOpen(false); }, [pathname]);
  if (privatePage) return null;

  return <>
    <button ref={trigger} className={styles.floatingButton} type="button" onClick={() => setOpen(true)} aria-label="Open quick contact form" title="Get in touch" aria-haspopup="dialog" aria-expanded={open}><FaCommentDots aria-hidden="true" /></button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} onKeyDown={keepFocusInside} onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      {open && <div className={styles.dialogContent}>
        <div className={styles.dialogHeader}><div><h2 id={titleId}>Let’s talk</h2><p>Have something in mind?</p></div><button className={styles.close} type="button" onClick={() => setOpen(false)} aria-label="Close quick contact form"><FaTimes aria-hidden="true" /></button></div>
        <ContactForm quick />
        <p className={styles.fullLink}>Prefer a dedicated page? <Link href="/contact" onClick={() => setOpen(false)}>Open contact page →</Link></p>
      </div>}
    </dialog>
  </>;
}
