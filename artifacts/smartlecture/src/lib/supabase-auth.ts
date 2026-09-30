const SUPABASE_URL = "https://brgfbkvroeugtyjfrivw.supabase.co";
const SUPABASE_KEY = "sb_publishable_sL2nYVmQvNJZognMWDeaqA_4PJxiW0R";
const SESSION_KEY = "sl_supabase_session";

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; name?: string };
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: SupabaseUser;
};

type AuthResult = {
  user?: SupabaseUser;
  session?: SupabaseSession | null;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  msg?: string;
  message?: string;
  error?: string;
  error_description?: string;
};

function authHeaders(accessToken?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_KEY,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function request<T>(path: string, body?: unknown, accessToken?: string): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: authHeaders(accessToken),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = (await response.json().catch(() => ({}))) as AuthResult & T;
  if (!response.ok) {
    throw new Error(
      payload.msg ||
      payload.message ||
      payload.error_description ||
      payload.error ||
      "Authentication request failed. Please try again."
    );
  }
  return payload as T;
}

function normalizeSession(payload: AuthResult): SupabaseSession | null {
  const session = payload.session ?? payload;
  if (!session.access_token || !session.refresh_token || !session.user) return null;
  const expiresIn = session.expires_in ?? 3600;
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: expiresIn,
    expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + expiresIn,
    token_type: session.token_type ?? "bearer",
    user: session.user,
  };
}

export function saveSession(session: SupabaseSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Existing API client reads this key; it now contains a real Supabase access token.
  localStorage.setItem("sl_auth", session.access_token);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("sl_auth");
}

export function readSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SupabaseSession) : null;
  } catch {
    clearSession();
    return null;
  }
}

export async function signUp(name: string, email: string, password: string) {
  const payload = await request<AuthResult>("signup", {
    email: email.trim().toLowerCase(),
    password,
    data: { full_name: name.trim(), name: name.trim() },
  });
  const session = normalizeSession(payload);
  if (session) saveSession(session);
  return { user: payload.user, session };
}

export async function signIn(email: string, password: string) {
  const payload = await request<AuthResult>("token?grant_type=password", {
    email: email.trim().toLowerCase(),
    password,
  });
  const session = normalizeSession(payload);
  if (!session) throw new Error("Supabase did not return a session. Please verify your email and try again.");
  saveSession(session);
  return session;
}

export async function getValidSession(): Promise<SupabaseSession | null> {
  const session = readSession();
  if (!session) return null;

  const expiresAt = session.expires_at ?? 0;
  if (expiresAt > Math.floor(Date.now() / 1000) + 60) {
    const check = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: authHeaders(session.access_token),
    });
    if (check.ok) return session;
  }

  try {
    const refreshed = await request<AuthResult>("token?grant_type=refresh_token", {
      refresh_token: session.refresh_token,
    });
    const next = normalizeSession(refreshed);
    if (next) {
      saveSession(next);
      return next;
    }
  } catch {
    // The refresh token may have expired or been revoked.
  }

  clearSession();
  return null;
}

export async function signOut() {
  const session = readSession();
  try {
    if (session?.access_token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: authHeaders(session.access_token),
      });
    }
  } finally {
    clearSession();
  }
}

export async function sendPasswordReset(email: string) {
  await request("recover", { email: email.trim().toLowerCase() });
}
