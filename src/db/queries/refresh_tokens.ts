import { db } from "../index.js";
import { refreshTokens, users } from "../schema.js";
import { eq, gte, and, isNull, gt } from "drizzle-orm";
import { firstOrUndefined } from "./utils.js";
import { config } from "../../config.js";


export async function writeRefreshToken(refreshToken: string, userID: string) {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 60);

  const rows = await db
    .insert(refreshTokens)
    .values({
      token: refreshToken,
      userId: userID,
      expiresAt: new Date(Date.now() + config.jwt.refreshDuration),
    })
    .onConflictDoNothing()
    .returning();

  return rows.length > 0;
}

export async function checkUserRefreshToken(refreshToken: string) {
  const [result] = await db
    .select({ user: users })
    .from(users)
    .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
    .where(
      and(
        eq(refreshTokens.token, refreshToken),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return result;
}

export async function revokeRefreshToken(refreshToken: string) {
  const rows = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, refreshToken))
    .returning();

  if (rows.length === 0) {
    throw new Error("Couldn't revoke token");
  }
}