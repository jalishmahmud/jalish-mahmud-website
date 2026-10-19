"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import { useRef } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import { marked } from "marked";
import articleStyles from "@/styles/article-content.module.css";
import styles from "./RichTextEditor.module.css";

const buttons = [["bold", "B"], ["italic", "I"], ["underline", "U"], ["strike", "S"], ["bulletList", "• List"], ["orderedList", "1. List"], ["blockquote", "Quote"], ["codeBlock", "Code"]];
const lowlight = createLowlight(all);

function isLikelyMarkdown(text) {
  return /(?:^|\n)\s{0,3}(?:#{1,6}\s|>\s|[-*+]\s|\d+[.)]\s|```|~~~)/m.test(text)
    || /(?:^|\n)\s*\|.+\|\s*\n\s*\|\s*:?-{3,}/m.test(text)
    || /\*\*\S[^*]*\*\*|__\S[^_]*__|\[[^\]]+\]\((?:https?:\/\/|\/)[^)]+\)/.test(text)
    || /(?:^|[\s(])(?:`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_)(?=$|[\s).,!?:;])/.test(text);
}

export default function RichTextEditor({ value, onChange }) {
  const fileInput = useRef(null);
  const editor = useEditor({
    extensions: [StarterKit.configure({ codeBlock: false, link: false, underline: false }), CodeBlockLowlight.configure({ lowlight }), Underline, Link.configure({ openOnClick: false }), Image.configure({ allowBase64: true }), TableKit],
    editorProps: {
      attributes: { class: articleStyles.articleContent },
      handlePaste: (_view, event) => {
        if (editor?.isActive("codeBlock") || event.clipboardData?.getData("text/html")) return false;
        const text = event.clipboardData?.getData("text/plain") || "";
        if (!isLikelyMarkdown(text)) return false;
        event.preventDefault();
        editor.chain().focus().insertContent(marked.parse(text, { gfm: true, breaks: false })).run();
        return true;
      },
    },
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });
  if (!editor) return <div className={styles.loading}>Loading editor…</div>;
  function insertImage(event) { const file = event.target.files?.[0]; if (!file) return; if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 1000000) return; const alt = window.prompt("Describe this image (leave empty only for a decorative image):", ""); if (alt === null) { event.target.value = ""; return; } const reader = new FileReader(); reader.onload = () => editor.chain().focus().setImage({ src: reader.result, alt: alt.trim().slice(0, 250) }).run(); reader.readAsDataURL(file); event.target.value = ""; }
  return <div className={styles.editor}><div className={styles.toolbar}><select aria-label="Text style" value={editor.isActive("heading") ? `h${editor.getAttributes("heading").level}` : "paragraph"} onChange={(event) => { const level = event.target.value; if (level === "paragraph") editor.chain().focus().setParagraph().run(); else editor.chain().focus().setHeading({ level: Number(level.slice(1)) }).run(); }}><option value="paragraph">Paragraph</option>{[1, 2, 3, 4, 5, 6].map((level) => <option key={level} value={`h${level}`}>H{level}</option>)}</select>{buttons.map(([action, label]) => <button type="button" key={action} className={editor.isActive(action) ? styles.active : ""} onClick={() => editor.chain().focus()[`toggle${action[0].toUpperCase()}${action.slice(1)}`]().run()}>{label}</button>)}<button type="button" onClick={() => { const url = window.prompt("Link URL"); if (url) editor.chain().focus().setLink({ href: url }).run(); }}>Link</button><button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table</button><button type="button" onClick={() => fileInput.current?.click()}>Image</button><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={insertImage} /><button type="button" onClick={() => { if (!editor.isActive("image")) { window.alert("Select an image in the article first."); return; } const alt = window.prompt("Image alt text (empty for decorative images):", editor.getAttributes("image").alt || ""); if (alt !== null) editor.chain().focus().updateAttributes("image", { alt: alt.trim().slice(0, 250) }).run(); }}>Image alt text</button><button type="button" onClick={() => editor.chain().focus().undo().run()}>Undo</button><button type="button" onClick={() => editor.chain().focus().redo().run()}>Redo</button></div><EditorContent editor={editor} /></div>;
}
