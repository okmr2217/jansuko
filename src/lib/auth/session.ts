import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30日間

export interface SessionUser {
  id: string;
  displayName: string;
  isAdmin: boolean;
}

interface SessionData {
  user: SessionUser;
  expiresAt: number;
}

/**
 * セッションを作成する
 */
export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const sessionData: SessionData = {
    user,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };

  // セッションデータをBase64エンコード
  const encoded = Buffer.from(JSON.stringify(sessionData)).toString("base64");

  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * セッションを取得する
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const decoded = Buffer.from(sessionCookie.value, "base64").toString(
      "utf-8"
    );
    const sessionData: SessionData = JSON.parse(decoded);

    // セッションの有効期限をチェック
    if (Date.now() > sessionData.expiresAt) {
      await destroySession();
      return null;
    }

    return sessionData.user;
  } catch {
    return null;
  }
}

/**
 * セッションを破棄する
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * セッションを更新する（有効期限の延長）
 */
export async function refreshSession(): Promise<void> {
  const user = await getSession();
  if (user) {
    await createSession(user);
  }
}
