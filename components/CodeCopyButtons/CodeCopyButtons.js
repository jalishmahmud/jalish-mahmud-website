"use client";

import { useEffect } from "react";

const icons = `
  <svg data-code-icon="copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
  <svg data-code-icon="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
`;

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Some browsers deny the Clipboard API but still allow a user-initiated copy.
    }
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("aria-hidden", "true");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  try {
    if (!document.execCommand("copy")) throw new Error("Copy failed");
  } finally {
    input.remove();
  }
}

export default function CodeCopyButtons({ slug }) {
  useEffect(() => {
    const root = document.querySelector("[data-code-copy-root]");
    if (!root) return;

    const controls = [...root.querySelectorAll("pre")].map((block) => {
      const code = block.textContent ?? "";
      const button = document.createElement("button");
      const status = document.createElement("span");
      let resetTimer;

      button.type = "button";
      button.className = "code-copy-button";
      button.setAttribute("aria-label", "Copy code");
      button.title = "Copy code";
      button.innerHTML = icons;
      status.className = "code-copy-status";
      status.setAttribute("role", "status");
      button.append(status);

      const reset = () => {
        button.dataset.state = "";
        button.setAttribute("aria-label", "Copy code");
        button.title = "Copy code";
        status.textContent = "";
      };
      const onClick = async () => {
        try {
          await copyText(code);
          button.dataset.state = "copied";
          button.setAttribute("aria-label", "Code copied");
          button.title = "Copied";
          status.textContent = "Code copied to clipboard";
        } catch {
          button.title = "Could not copy code";
          status.textContent = "Could not copy code";
        }
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(reset, 2000);
      };

      button.addEventListener("click", onClick);
      block.append(button);
      return () => {
        window.clearTimeout(resetTimer);
        button.removeEventListener("click", onClick);
        button.remove();
      };
    });

    return () => controls.forEach((cleanup) => cleanup());
  }, [slug]);

  return null;
}
