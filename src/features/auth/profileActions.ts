import "client-only";
import { updateUserProfile } from "@/api/user";
import { accessToken, getSession } from "@/shared/auth/session";
import { publishCurrentUser } from "@/features/auth/useCurrentUser";
import type { ProfileUpdate } from "@/dto";
export async function updateProfile(values: ProfileUpdate) {
  const token = await accessToken();
  if (!token) throw new Error("UNAUTHENTICATED");
  const user = await updateUserProfile(values, token);
  if (getSession()?.accessToken === token) publishCurrentUser(token, user);
  return user;
}
