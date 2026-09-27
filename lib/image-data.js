// Server-side decoding shared by upload validation and the public image route.
export function decodeBlogImage(value) {
  if (typeof value !== "string" || !value) return null;
  const match = value.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([a-z0-9+/=\s]+)$/i);
  if (value.startsWith("data:") && !match) return null;
  const encoded = (match?.[2] || value).replace(/\s/g, "");
  if (!/^[a-z0-9+/]+={0,2}$/i.test(encoded) || encoded.length < 16) return null;
  const buffer = Buffer.from(encoded, "base64");
  let mime;
  if (buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") mime = "image/png";
  else if (buffer.subarray(0, 3).toString("hex") === "ffd8ff") mime = "image/jpeg";
  else if (buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") mime = "image/webp";
  if (!mime || (match && match[1].toLowerCase().replace("image/jpg", "image/jpeg") !== mime)) return null;
  return { buffer, mime };
}
