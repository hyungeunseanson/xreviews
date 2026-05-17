import path from "node:path";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { auditLogs, createDb, users } from "@xreviews/db";

function getEmailArg() {
  const inlineArg = process.argv.find((arg) => arg.startsWith("--email="));

  if (inlineArg) {
    return inlineArg.slice("--email=".length).trim().toLowerCase();
  }

  const emailFlagIndex = process.argv.indexOf("--email");
  const emailValue =
    emailFlagIndex >= 0 ? process.argv[emailFlagIndex + 1] : undefined;

  return emailValue?.trim().toLowerCase();
}

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const email = getEmailArg();

if (!email) {
  console.error("Usage: pnpm admin:promote --email=admin@example.com");
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  console.warn(
    "Production warning: use this script only through an approved operational process."
  );
}

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const db = createDb(databaseUrl);
const [user] = await db
  .select({
    id: users.id,
    email: users.email,
    role: users.role
  })
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

if (!user) {
  console.error(JSON.stringify({ found: false, email }));
  process.exit(1);
}

if (user.role !== "admin") {
  await db
    .update(users)
    .set({
      role: "admin",
      updatedAt: new Date()
    })
    .where(eq(users.id, user.id));
}

await db.insert(auditLogs).values({
  actorUserId: null,
  actorRole: "admin",
  action: "admin_promoted_by_script",
  targetType: "user",
  targetId: user.id,
  metadata: {
    userId: user.id,
    email: user.email,
    previousRole: user.role,
    nextRole: "admin",
    changed: user.role !== "admin",
    phase: "phase_6_admin_moderation"
  }
});

console.log(
  JSON.stringify({
    found: true,
    userId: user.id,
    email: user.email,
    previousRole: user.role,
    nextRole: "admin",
    changed: user.role !== "admin"
  })
);
