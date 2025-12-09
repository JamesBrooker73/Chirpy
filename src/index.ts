import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareErrorResponse, middlewareLogResponse, middlewareMetricsInc } from "./api/middleware.js";
import { handlerFileServerHits } from "./admin/metrics.js";
import { handlerResetFileServerHits } from "./admin/reset.js";
import { handlerCreateChirp, handlerGetAllChirps, handlerGetChirpById } from "./api/chirps.js";
import { config } from "./config.js";
import { handlerCreateUser } from "./api/users.js";
import { handlerCheckRefreshToken, handlerCheckRevokeToken, handlerLogin } from "./api/auth.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(express.json());
app.use(middlewareLogResponse);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerFileServerHits);

app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerGetAllChirps(req, res)).catch(next);
})

app.get("/api/chirps/:chirpID", (req, res, next) => {
  Promise.resolve(handlerGetChirpById(req, res)).catch(next);
})

app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerResetFileServerHits(req, res)).catch(next);
} )

app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerCreateChirp(req, res)).catch(next);
})

app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerCreateUser(req,res)).catch(next);
});

app.post("/api/login", (req, res, next) => {
  Promise.resolve(handlerLogin(req, res)).catch(next);
})

app.post("/api/refresh", (req, res, next) => {
  Promise.resolve(handlerCheckRefreshToken(req, res)).catch(next);
})

app.post("/api/revoke", (req, res, next) => {
  Promise.resolve(handlerCheckRevokeToken(req, res)).catch(next);
})

app.use(middlewareErrorResponse);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});