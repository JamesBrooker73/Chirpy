import type { NextFunction, Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError } from "./error.js";
import { createChirp, getAllChirps, getChirpByID } from "../db/queries/chirps.js";
import { validateUser } from "../db/queries/users.js";

export async function handlerCreateChirp(req: Request, res: Response): Promise<void> {
  type Parameters = {
      body: string;
      userId: string;
    };
  
  const params: Parameters = req.body;
  
  if (
    typeof params.userId !== "string" ||
    typeof params.body !== "string" ||
    params.userId.length === 0 ||
    params.body.length === 0
  ) {
  throw new BadRequestError("Invalid parameters");
  }

  const user = await validateUser(params.userId);

  if(!user) {
    throw new BadRequestError("User does not exist");
  }

  const cleaned = validateChirp(params.body);
  
  const chirp = await createChirp({ 
    body: cleaned,
    userId: params.userId
  });
  
  if (!chirp) {
    throw new Error("Could not create chirp");
  } 
    
  respondWithJSON(res, 201, chirp);
}

function validateChirp(chirpText: string): string {
  const maxChirpLength = 140;
  if (chirpText.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }
  
  return cleanChirp(chirpText);
}

function cleanChirp(chirpText: string): string {
  const wordArray = chirpText.trim().split(" ");
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
  return cleanString;
}

export async function handlerGetAllChirps(req: Request, res: Response): Promise<void> { 
  const chirps = await getAllChirps();
  respondWithJSON(res, 200, chirps);
}

export async function handlerGetChirpById(req: Request, res: Response): Promise<void> {
  const chirpId = req.params.chirpID;

  if (!chirpId) {
    throw new BadRequestError("There's no chirpId in the request");
  }

  const chirp = await getChirpByID(chirpId)
  if(!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
  }
  respondWithJSON(res, 200, chirp);
}