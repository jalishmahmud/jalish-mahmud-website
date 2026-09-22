"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import { useRef } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import styles from "./RichTextEditor.module.css";

const buttons = [["bold", "B"], ["italic", "I"], ["underline", "U"], ["strike", "S"], ["bulletList", "• List"], ["orderedList", "1. List"], ["blockquote", "Quote"], ["codeBlock", "Code"]];
const lowlight = createLowlight(all);
export default function RichTextEditor({ value, onChange }) {
  const fileInput = useRef(null);
  const editor = useEditor({ extensions: [StarterKit.configure({ codeBlock: false }), CodeBlockLowlight.configure({ lowlight }), Underline, Link.configure({ openOnClick: false }), Image, TextAlign.configure({ types: ["heading", "paragraph"] })], content: value, immediatelyRender: false, onUpdate: ({ editor: instance }) => onChange(instance.getHTML()) });
  if (!editor) return <div className={styles.loading}>Loading editor…</div>;
  function insertImage(event) { const file = event.target.files?.[0]; if (!file) return; if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 1000000) return; const reader = new FileReader(); reader.onload = () => editor.chain().focus().setImage({ src: reader.result }).run(); reader.readAsDataURL(file); event.target.value = ""; }
  return <div className={styles.editor}><div className={styles.toolbar}>{["paragraph", "heading"].map((item) => <select key={item} aria-label="Text style" value={item === "heading" && editor.isActive("heading") ? `h${editor.getAttributes("heading").level}` : item} onChange={(e) => { const val = e.target.value; if (val === "paragraph") editor.chain().focus().setParagraph().run(); else editor.chain().focus().toggleHeading({ level: Number(val.slice(1)) }).run(); }}><option value={item}>{item === "paragraph" ? "Paragraph" : "Heading"}</option>{item === "heading" && [1, 2, 3].map((level) => <option key={level} value={`h${level}`}>H{level}</option>)}</select>)}{buttons.map(([action, label]) => <button type="button" key={action} className={editor.isActive(action) ? styles.active : ""} onClick={() => editor.chain().focus()[`toggle${action[0].toUpperCase()}${action.slice(1)}`]().run()}>{label}</button>)}<button type="button" onClick={() => { const url = window.prompt("Link URL"); if (url) editor.chain().focus().setLink({ href: url }).run(); }}>Link</button><button type="button" onClick={() => fileInput.current?.click()}>Image</button><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={insertImage} /><button type="button" onClick={() => editor.chain().focus().undo().run()}>Undo</button><button type="button" onClick={() => editor.chain().focus().redo().run()}>Redo</button></div><EditorContent editor={editor} /></div>;
}
