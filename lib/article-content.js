import sanitizeHtml from "sanitize-html";

function tableCell(tagName, attributes) {
  const align = /\btext-align\s*:\s*(left|center|right)\b/i.exec(attributes.style || "")?.[1]?.toLowerCase()
    || attributes.align?.toLowerCase();
  return { tagName, attribs: { ...attributes, ...(align && ["left", "center", "right"].includes(align) ? { align } : {}) } };
}

export function sanitizeContent(html) {
  const cleaned = sanitizeHtml(html || "", {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      span: ["class"],
      code: ["class"],
      pre: ["class"],
      th: ["colspan", "rowspan", "align"],
      td: ["colspan", "rowspan", "align"],
    },
    allowedClasses: { span: ["hljs-*"], code: ["language-*"], pre: ["language-*"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
      th: tableCell,
      td: tableCell,
    },
    allowedSchemes: ["http", "https", "data"],
    exclusiveFilter: (frame) => frame.tag === "div" ? "excludeTag" : false,
  });
  // Pasted editors often place a <br> between block elements. The blocks
  // already create the separation; keep breaks inside nonempty paragraphs.
  return cleaned
    .replace(/<p>(?:(?:\s|&nbsp;|&#160;|<br\s*\/?>(?:\s|&nbsp;)*)|<\/?(?:span|strong|em|b|i|u)(?:\s[^>]*)?>)*<\/p>/gi, "")
    .replace(/(<\/(?:p|div|section|article|blockquote|ul|ol|h[1-6]|pre|table)>)(?:\s*<br\s*\/?>(?:\s|&nbsp;)*)+(?=<(?:p|div|section|article|blockquote|ul|ol|h[1-6]|pre|table)\b)/gi, "$1");
}
