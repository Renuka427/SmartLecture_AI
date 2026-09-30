import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Authentication is handled by Supabase Auth on the frontend.
// These legacy endpoints intentionally reject requests so they cannot issue fake tokens
// or store plaintext passwords in the application database.
router.post("/auth/login", (_req, res) => {
  res.status(410).json({ error: "Legacy authentication is disabled. Use Supabase Auth." });
});

router.post("/auth/register", (_req, res) => {
  res.status(410).json({ error: "Legacy authentication is disabled. Use Supabase Auth." });
});

export default router;
