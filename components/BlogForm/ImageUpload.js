"use client";
import { useId, useState } from "react";
import ContentImage from "@/components/ContentImage/ContentImage";
import { imagePreviewSource } from "@/lib/blog-fields";
import styles from "./BlogForm.module.css";

export default function ImageUpload({ label, value, onChange, width = 1200, height = 630, help }) {
  const id = useId();
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const src = imagePreviewSource(value);
  const bytes = value?.startsWith("data:") ? Math.floor((value.split(",")[1]?.replace(/=+$/, "").length || 0) * 3 / 4) : null;
  const mime = value?.match(/^data:image\/(\w+);/)?.[1];
  async function select(event) {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 1500000) { setError("Use a JPG, PNG or WebP image up to 1.5 MB."); return; }
    try {
      const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
      const dimensions = await new Promise((resolve, reject) => { const image = new window.Image(); image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight }); image.onerror = reject; image.src = data; });
      setDetails(dimensions); onChange(data);
    } catch { setError("This image could not be read. Please choose another file."); }
  }
  return <div className={styles.uploadGroup}>
    <label htmlFor={id}>{label}</label>
    <p className={styles.help} id={`${id}-help`}>Recommended: {width} × {height} px<br />JPG, PNG or WebP • Maximum 1.5 MB{help && <><br />{help}</>}</p>
    <input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={select} aria-describedby={`${id}-help`} />
    {src && <>
      <ContentImage src={src} alt={`${label} preview`} className={styles.preview} onLoad={(event) => setDetails({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} />
      <p className={styles.help}>{details && `Dimensions: ${details.width} × ${details.height}`}{bytes !== null && ` • Size: ${Math.round(bytes / 1000)} KB`}{mime && ` • Format: ${mime.toUpperCase()}`}</p>
      {details && Math.abs(details.width / details.height / (width / height) - 1) > .15 && <p className={styles.help}>Your image has a different aspect ratio. It can still be used; the recommended ratio gives more predictable results.</p>}
      <button className="btn btnOutline" type="button" onClick={() => { onChange(""); setDetails(null); }}>Remove {label.toLowerCase()}</button>
    </>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
  </div>;
}
