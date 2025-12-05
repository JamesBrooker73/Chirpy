import { db } from "../index.js";
import { chirps, NewChirp, NewUser, users } from "../schema.js";
import { asc, eq } from "drizzle-orm";
import { firstOrUndefined } from "./utils.js";

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

export async function getChirpByID(chirpId: string) {
  const result = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, chirpId))

  return firstOrUndefined(result)

}