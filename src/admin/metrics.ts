import type { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerFileServerHits(_: Request, res: Response): Promise<void> {
  const htmlResponse = 
  `<html>
    <body>
      <h1>Welcome, Chirpy Admin</h1>
      <p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
    </body>
  </html>`
  res.status(200).contentType("text/html; charset=utf-8").send(htmlResponse);
  
}