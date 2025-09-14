import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleDatasetProxy } from "./routes/dataset-proxy";
import { handleDatasetJson } from "./routes/dataset-json";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Proxy for external Excel dataset (avoids CORS in browser)
  app.get("/api/dataset", handleDatasetProxy);
  // Server-side parsed JSON endpoint
  app.get("/api/dataset-json", handleDatasetJson);

  return app;
}
