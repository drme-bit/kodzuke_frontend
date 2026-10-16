export type CurrentUser = {
  id: string;
  username: string;
  avatar: string | null;
  description?: string | null;
};
export type ProfileUpdate = {
  username: string;
  avatar: string;
  description: string;
};
export interface AccountPoster {
  id: string;
  posterUrl: string;
}
