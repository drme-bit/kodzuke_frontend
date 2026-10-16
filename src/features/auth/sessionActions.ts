import { authenticateRequest, revokeSession } from "@/api/auth";
import { getSession, saveSession } from "@/shared/auth/session";
import type { Credentials } from "@/dto";
export async function authenticate(
  credentials: Credentials,
  register: boolean,
): Promise<void> {
  saveSession(await authenticateRequest(credentials, register));
}
export async function signOut(): Promise<void> {
  const session = getSession();
  saveSession(null);
  if (session)
    await revokeSession(session.refreshToken).catch(() => {
      // Local logout remains effective when the backend is temporarily unavailable.
    });
}
