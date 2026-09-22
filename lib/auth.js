import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDatabase } from "./mongodb";

const COOKIE = "jalish_admin_session";
const maxAge = 60 * 60 * 24 * 7;

function secret() {
  if (!process.env.ADMIN_SESSION_SECRET) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return process.env.ADMIN_SESSION_SECRET;
}

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

function encode(payload) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${value}.${sign(value)}`;
}

function decode(token) {
  if (!token) return null;
  const [value, signature] = token.split(".");
  if (!value || !signature) return null;
  const expected = sign(value);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(value, "base64url").toString());
  return payload.expiresAt > Date.now() ? payload : null;
}

export async function getSession() {
  return decode((await cookies()).get(COOKIE)?.value);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.adminId || session.role !== "super-admin") throw new Error("UNAUTHORIZED");
  return session;
}

export async function authenticateAdmin(identifier, password) {
  const db = await getDatabase();
  const admin = await db.collection("admins").findOne({
    $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
  });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return false;
  (await cookies()).set(COOKIE, encode({ adminId: admin._id.toString(), role: admin.role, expiresAt: Date.now() + maxAge * 1000 }), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge,
  });
  return true;
}

export async function clearSession() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
}
