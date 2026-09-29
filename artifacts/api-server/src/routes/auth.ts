import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody, RegisterBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  res.json({
    token: `fake-jwt-${user.id}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      joinedAt: user.createdAt,
    },
  });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  try {
    const parsed = RegisterBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, parsed.data.email));

    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const [user] = await db
      .insert(usersTable)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      })
      .returning();

    res.status(201).json({
      token: `fake-jwt-${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        joinedAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Registration failed",
    });
  }
});

export default router;
