import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const state = globalThis.__jalishMongooseState ??= { promise: null };

export function isDatabaseConfigured() {
  return Boolean(uri);
}

export async function connectToDatabase() {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (mongoose.connection.readyState === 1) return mongoose;
  if (mongoose.connection.readyState === 0) state.promise = null;

  if (!state.promise) {
    state.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined,
      autoIndex: false,
      autoCreate: false,
      bufferCommands: false,
    }).catch((error) => {
      state.promise = null;
      throw error;
    });
  }

  return state.promise;
}
