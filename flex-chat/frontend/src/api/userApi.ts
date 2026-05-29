import api from "../api";
import apiRoutes from "../constants/routes/apiRoutes";

import type { GetUsersParams,UserProfile, UserProfileUpdate } from "../types/user";
const userRoutes = apiRoutes.user;

const getUsers = async (params: GetUsersParams) => {
  const res = await api.get(userRoutes.getUsers, { params });
  return res.data;
};

const getMyProfile = async () => {
  const res = await api.get(userRoutes.getCurrentUserProfile);
  return res.data;
}

const updateUserProfile = async (params: UserProfileUpdate) : Promise<UserProfile>=> {
  const res = await api.post(userRoutes.updateUserProfile, params)
  return res.data;
}

export type{GetUsersParams,UserProfile, UserProfileUpdate};

const userApi = { getUsers, getMyProfile, updateUserProfile };
export default userApi;





