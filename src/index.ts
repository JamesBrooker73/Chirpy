import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareErrorResponse, middlewareLogResponse, middlewareMetricsInc } from "./api/middleware.js";
import { handlerFileServerHits } from "./admin/metrics.js";
import { handlerResetFileServerHits } from "./admin/reset.js";
import { handlerValidateChirp } from "./api/chirp.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(middlewareLogResponse);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerFileServerHits);
app.post("/admin/reset", handlerResetFileServerHits);
app.post("/api/validate_chirp", async (req, res, next) => {
  try {
    await (handlerValidateChirp(req, res));
  } catch (err) {
    next(err);
  }
});
app.use(middlewareErrorResponse);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});