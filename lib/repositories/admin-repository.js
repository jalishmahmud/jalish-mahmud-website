import Admin from "../../models/Admin.js";
import { connectToDatabase } from "../db/mongoose.js";

export async function findAdminByIdentifier(identifier) {
  await connectToDatabase();
  return Admin.findOne({
    $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
  }).lean().exec();
}

export async function createAdmin({ username, email, passwordHash, role }) {
  await connectToDatabase();
  const normalizedEmail = email.toLowerCase();
  const exists = await Admin.exists({ $or: [{ username }, { email: normalizedEmail }] });
  if (exists) throw new Error("An admin with that username or email already exists.");
  const now = new Date();
  return Admin.create({ username, email: normalizedEmail, passwordHash, role, createdAt: now, updatedAt: now });
}
