import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "circularia_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

export type UserRole = "admin" | "designer" | "finance" | "marketing" | "sustainability" | "operations";

type SessionPayload = {
  email: string;
  name: string | null;
  role: UserRole;
};

function getSessionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser) {
  const key = getSessionKey();
  if (!key) {
    throw new Error("Missing SESSION_SECRET environment variable.");
  }

  return new SignJWT({ email: user.email, name: user.name, role: user.role } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(key);
}

export async function verifySession(token?: string | null): Promise<SessionUser | null> {
  if (!token) return null;

  const key = getSessionKey();
  if (!key) return null;

  try {
    const { payload } = await jwtVerify<SessionPayload>(token, key);
    if (!payload.sub || !payload.email) return null;

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name ?? null,
      role: payload.role ?? "designer",
    };
  } catch {
    return null;
  }
}
