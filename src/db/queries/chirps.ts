import { db } from "../index.js";
import { chirps, NewChirp, NewUser, users } from "../schema.js";
import { asc, eq, and } from "drizzle-orm";
import { firstOrUndefined } from "./utils.js";
import { ForbiddenError, NotFoundError } from "../../api/error.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values({
      body: chirp.body,
      userId: chirp.userId
    })
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function getAllChirps() {
  const result = await db
    .select()
    .from(chirps)
    .orderBy(asc(chirps.createdAt));

  return result;
}

export async function getChirpByID(chirpID: string) {
  const result = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, chirpID))

  return firstOrUndefined(result)

}

export async function deleteChirp(chirpID: string) {
  const rows = await db.delete(chirps).where(eq(chirps.id, chirpID)).returning();
  return rows.length > 0;
}