import mongoose from "mongoose";
import { getEnv } from "@/lib/env";

const { mongodbUri, mongodbDbName } = getEnv();

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseCache ?? {
  conn: null,
  promise: null
};

global.mongooseCache = cached;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongodbUri, {
      dbName: mongodbDbName,
      bufferCommands: false
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
