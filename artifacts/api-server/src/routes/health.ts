import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Debug endpoint to verify env var injection on the running platform.
// Intentionally does not expose the actual API key.
router.get("/healthz/elevenlabs", (_req, res) => {
  const key = (process.env.ELEVENLABS_API_KEY || "").trim();
  res.json({
    hasKey: key.length > 0,
    length: key.length,
  });
});

export default router;
