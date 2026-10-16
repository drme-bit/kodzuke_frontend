export type AuthTokens = { accessToken: string; refreshToken: string };
export interface Credentials {
  email: string;
  password: string;
  username?: string;
}
