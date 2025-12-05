import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from "drizzle-orm";
import { firstOrUndefined } from "./utils.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function validateUser(userID: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userID));

  return firstOrUndefined(result);
}

export async function deleteUsers() {
  await db
    .delete(users);
}