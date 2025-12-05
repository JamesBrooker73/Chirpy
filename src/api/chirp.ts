import type { NextFunction, Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError } from "./error.js";

export async function handlerValidateChirp(req: Request, res: Response): Promise<void> {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;
  const maxChirpLength = 140;

  if (params.body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const wordArray = params.body.trim().split(" ");
  const bannedWords = ["kerfuffle", "sharbert", "fornax"];
  const filteredWords = [];
  for (const word of wordArray) {
    if (bannedWords.includes(word.toLowerCase())) {
      filteredWords.push("****");
      continue;
    }
    filteredWords.push(word);
  }
  const cleanString = filteredWords.join(" ");
  respondWithJSON(res, 200, {cleanedBody: cleanString, });
}