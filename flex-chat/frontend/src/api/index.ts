import axios from "axios";

import apiRoutes from "../constants/routes/apiRoutes";
import routes from "../constants/routes/routes";
import { useAuthStore } from "../stores/authStore";


const api = axios.create({
  baseURL: apiRoutes.baseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
  const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginPage = window.location.pathname === routes.login;
    const isRefreshCall = error.config?.url === apiRoutes.account.refresh;

    if (error.response?.status === 401 && !isLoginPage && !isRefreshCall) {
      console.log("error in axios");
      if (!isRedirecting) {
        isRedirecting = true;
        useAuthStore.getState().clearToken();
        window.location.href = routes.login;
        setTimeout(() => { isRedirecting = false; }, 2000);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
