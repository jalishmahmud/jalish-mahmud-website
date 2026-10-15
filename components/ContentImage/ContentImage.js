import Image from "next/image";

// Dynamic article images do not have the automatic blur preview available to
// statically imported images. Keep a small preview visible until each loads.
const imagePlaceholder = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="shimmer"><stop offset="0%" stop-color="#263449"/><stop offset="50%" stop-color="#52627a"/><stop offset="100%" stop-color="#263449"/><animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="1.8s" repeatCount="indefinite"/></linearGradient></defs><rect width="1200" height="630" fill="#263449"/><rect width="1200" height="630" fill="url(#shimmer)"/></svg>'
)}`;

// Optimize the existing trusted photo host. Uploaded public image endpoints and
// other author-supplied hosts retain their original URL without a broad allowlist.
export default function ContentImage({ src, alt, placeholder = imagePlaceholder, ...props }) {
  const optimized = typeof src === "string" && src.startsWith("https://images.unsplash.com/");
  return <Image src={src} alt={alt} width={1200} height={630} sizes="(max-width: 768px) 100vw, 780px" unoptimized={!optimized} placeholder={placeholder} {...props} />;
}
