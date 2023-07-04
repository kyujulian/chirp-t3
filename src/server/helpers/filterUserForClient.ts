import type { User } from "@clerk/backend/dist/types/api";
export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username ?? user.firstName + "" + user.lastName,
    profilePicture: user.profileImageUrl,
  };
};