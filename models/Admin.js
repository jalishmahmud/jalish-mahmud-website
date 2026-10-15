import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: String,
  email: String,
  passwordHash: String,
  role: String,
  createdAt: Date,
  updatedAt: Date,
}, { collection: "admins", strict: false, versionKey: false, autoIndex: false, autoCreate: false });

export default mongoose.models.Admin || mongoose.model("Admin", adminSchema);
