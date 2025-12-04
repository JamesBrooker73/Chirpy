import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponse, middlewareMetricsInc } from "./middleware.js";
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
app.post("/api/validate_chirp", handlerValidateChirp);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});