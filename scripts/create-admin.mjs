import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

const rl = createInterface({ input, output });
const answer = (question, hidden = false) => hidden ? new Promise((resolve) => { process.stdout.write(question); let value = ""; input.setRawMode?.(true); input.on("data", (chunk) => { const text = chunk.toString(); if (text === "\r" || text === "\n") { input.setRawMode?.(false); input.pause(); process.stdout.write("\n"); resolve(value); } else if (text === "\u0003") process.exit(1); else value += text; }); }) : rl.question(question);

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI before running this script.");
const username = await answer("Username: ");
const email = await answer("Email: ");
const password = await answer("Password: ", true);
const client = await new MongoClient(process.env.MONGODB_URI).connect();
const db = client.db(process.env.MONGODB_DB || undefined);
const exists = await db.collection("admins").findOne({ $or: [{ username }, { email: email.toLowerCase() }] });
if (exists) throw new Error("An admin with that username or email already exists.");
const now = new Date();
await db.collection("admins").insertOne({ username, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: "super-admin", createdAt: now, updatedAt: now });
console.log("Super-admin created successfully.");
await client.close();
rl.close();
