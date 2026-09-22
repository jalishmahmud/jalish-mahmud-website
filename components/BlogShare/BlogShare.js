"use client";
import { useState } from "react";
import { FaFacebook, FaLinkedin, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import styles from "./BlogShare.module.css";

export default function BlogShare({ title }) {
  const [copied, setCopied] = useState(false);
  const share = typeof window === "undefined" ? "" : encodeURIComponent(window.location.href);
  const text = encodeURIComponent(title);
  const links = [["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${share}`, FaLinkedin], ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${share}`, FaFacebook], ["X", `https://twitter.com/intent/tweet?text=${text}&url=${share}`, FaXTwitter], ["WhatsApp", `https://wa.me/?text=${text}%20${share}`, FaWhatsapp]];
  function openShare(event, href) {
    event.preventDefault();
    const width = 640;
    const height = 620;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    const popup = window.open(href, "blog-share", `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
    if (!popup) window.location.assign(href);
  }
  return <div className={styles.share}><span>Share this article</span><div>{links.map(([label, href, Icon]) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Share on ${label}`} onClick={(event) => openShare(event, href)}><Icon /></a>)}<button type="button" onClick={async () => { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? "Copied!" : "Copy link"}</button></div></div>;
}
