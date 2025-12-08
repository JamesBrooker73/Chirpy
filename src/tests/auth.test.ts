import { describe, it, expect, beforeAll } from "vitest";
import { checkPasswordHash, extractBearerToken, hashPassword, makeJWT, validateJWT } from "../auth.js";
import { BadRequestError, UnauthorizedError } from "../api/error.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const result = await checkPasswordHash("wrongPassword", hash1);
    expect(result).toBe(false);
  });

  it("should return false when password doesn't match a different hash", async () => {
    const result = await checkPasswordHash(password1, hash2);
    expect(result).toBe(false);
  });

  it("should return false for an empty password", async () => {
    const result = await checkPasswordHash("", hash1);
    expect(result).toBe(false);
  });

  it("should return false for an invalid hash", async () => {
    const result = await checkPasswordHash(password1, "invalidhash");
    expect(result).toBe(false);
  });
});

describe("JWT tokens", () => {
  const userID1 = "9746eb57-f4fd-4dff-b71e-d619048cedbc";
  const userID2 = "d7f25a13-6fad-4681-9128-da99db4b1aa8";
  const secret1 = "secret1";
  const secret2 = "secret2";
  let token1: string;
  let token2: string;

  const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

  beforeAll(async () => {
    token1 = makeJWT(userID1, 100000, secret1);
    token2 = makeJWT(userID2, 1, secret2);
  });

  it("should return a token string for generating a JWT token", () => {
    const result = makeJWT(userID1, 1000, secret1);
    expect(result).toBeTypeOf("string");
  });

  it("should return a user ID from the validated token", () => {
    const result = validateJWT(token1, secret1);
    expect(result).toBeTypeOf("string");
    expect(result).toBe(userID1);
  });

  it("should throw a UnauthorizedError because of different secret", () => {
    expect(() => validateJWT(token1, secret2))
      .toThrowError(UnauthorizedError);
  });

  it("should throw a UnauthorizedError because token has expired", async () => {
    await delay(2000);
    expect(() => validateJWT(token2, secret2)).toThrowError(UnauthorizedError);
  });

  describe("extractBearerToken", () => {
  it("should extract the token from a valid header", () => {
    const token = "mySecretToken";
    const header = `Bearer ${token}`;
    expect(extractBearerToken(header)).toBe(token);
  });

  it("should extract the token even if there are extra parts", () => {
    const token = "mySecretToken";
    const header = `Bearer ${token} extra-data`;
    expect(extractBearerToken(header)).toBe(token);
  });

  it("should throw a BadRequestError if the header does not contain at least two parts", () => {
    const header = "Bearer";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });

  it('should throw a BadRequestError if the header does not start with "Bearer"', () => {
    const header = "Basic mySecretToken";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });

  it("should throw a BadRequestError if the header is an empty string", () => {
    const header = "";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });
});

});