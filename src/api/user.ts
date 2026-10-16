import "client-only";
import { gql } from "./graphql/client";
import type { CurrentUser, ProfileUpdate } from "@/dto";
const fields = "id username avatar description";
export async function fetchCurrentUser(token: string) {
  return (
    await gql<{ getUser: CurrentUser | null }>(
      `query CurrentUser{getUser{${fields}}}`,
      undefined,
      { token, fresh: true },
    )
  ).getUser;
}
export async function updateUserProfile(values: ProfileUpdate, token: string) {
  return (
    await gql<{ updateProfile: CurrentUser }>(
      `mutation UpdateProfile($username:String!,$avatar:String,$description:String){updateProfile(username:$username,avatar:$avatar,description:$description){${fields}}}`,
      values,
      { token, fresh: true },
    )
  ).updateProfile;
}
