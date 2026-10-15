import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { createAdmin } from "../lib/repositories/admin-repository.js";

const rl = createInterface({ input, output });
const answer = (question, hidden = false) => hidden ? new Promise((resolve) => { process.stdout.write(question); let value = ""; input.setRawMode?.(true); input.on("data", (chunk) => { const text = chunk.toString(); if (text === "\r" || text === "\n") { input.setRawMode?.(false); input.pause(); process.stdout.write("\n"); resolve(value); } else if (text === "\u0003") process.exit(1); else value += text; }); }) : rl.question(question);

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI before running this script.");
const username = await answer("Username: ");
const email = await answer("Email: ");
const password = await answer("Password: ", true);
try {
  await createAdmin({ username, email, passwordHash: await bcrypt.hash(password, 12), role: "super-admin" });
  console.log("Super-admin created successfully.");
} finally {
  await mongoose.disconnect();
  rl.close();
}
