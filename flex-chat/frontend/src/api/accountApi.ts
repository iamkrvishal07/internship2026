import api from "../api";
import apiRoutes from "../constants/routes/apiRoutes";

const account = apiRoutes.account;
 const login = async (data: {
  username: string;
  password: string;
}) => {
  const res = await api.post(account.login, data);
  return res.data;
};

 const refreshToken = async () => {
  const res = await api.post(account.refresh);
  return res.data;
};

 const register = async (data: {
  email: string;
}) => {
  const res = await api.post(account.register, data);
  return res.data;
};

 const verifyOtp = async (data: {
  email: string;
  username: string;
  otp: string;
  password: string;
}) => {
  const res = await api.post(account.verifyOtp, data);
  return res.data;
};

 const logout = async () => {
  const res = await api.post(account.logout);
  return res.data;
};

const checkUsername = async (username: string): Promise<{ isAvailable: boolean }> => {
  const res = await api.get(apiRoutes.account.checkUsername, { params: { username } });
  return res.data;
};

const checkEmail = async (email: string): Promise<{ isAvailable: boolean }> => {
  const res = await api.get(apiRoutes.account.checkEmail, { params: { email } });
  return res.data;
};

 const accountApi = {login, refreshToken, register, verifyOtp, logout,checkEmail,checkUsername};

 export default accountApi;