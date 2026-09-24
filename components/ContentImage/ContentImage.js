import Image from "next/image";

// Optimize the existing trusted photo host. Uploaded public image endpoints and
// other author-supplied hosts retain their original URL without a broad allowlist.
export default function ContentImage({ src, alt, ...props }) {
  const optimized = typeof src === "string" && src.startsWith("https://images.unsplash.com/");
  return <Image src={src} alt={alt} width={1200} height={630} sizes="(max-width: 768px) 100vw, 780px" unoptimized={!optimized} {...props} />;
}
