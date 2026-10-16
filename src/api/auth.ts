import "client-only";
import { gql } from "./graphql/client";
import type { AuthTokens, Credentials } from "@/dto";
export async function authenticateRequest(
  credentials: Credentials,
  register: boolean,
) {
  const query = register
    ? `mutation Register($username:String!,$email:String!,$password:String!){register(username:$username,email:$email,password:$password){accessToken refreshToken}}`
    : `mutation Login($email:String!,$password:String!){login(email:$email,password:$password){accessToken refreshToken}}`;
  const data = await gql<{
    login?: AuthTokens | null;
    register?: AuthTokens | null;
  }>(query, { ...credentials }, { fresh: true });
  const tokens = register ? data.register : data.login;
  if (!tokens?.accessToken || !tokens.refreshToken)
    throw new Error("Authentication failed");
  return tokens;
}
export async function refreshSession(token: string) {
  return (
    await gql<{ refresh: AuthTokens | null }>(
      `mutation RefreshSession($token:String!){refresh(refreshToken:$token){accessToken refreshToken}}`,
      { token },
      { fresh: true },
    )
  ).refresh;
}
export async function revokeSession(token: string) {
  await gql(
    `mutation Logout($token:String!){logout(refreshToken:$token)}`,
    { token },
    { fresh: true },
  );
}
