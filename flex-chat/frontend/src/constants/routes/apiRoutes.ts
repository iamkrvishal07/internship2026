const BASE_URL = "https://localhost:7069/api";
const SIGNALR_URL = "https://localhost:7069/hubs/chat";

const ACCOUNT_BASE = "/account";
const LOGIN_ROUTE = "/account/login";
const REFRESH_ROUTE = "/account/refresh";
const REGISTER_ROUTE = "/account/register";
const VERIFY_OTP_ROUTE = "/account/verify-otp";
const LOGOUT_ROUTE = "/account/logout";
const CHECK_USERNAME_ROUTE = "/account/check-username";
const CHECK_EMAIL_ROUTE = "/account/check-email";

const USER_BASE = "/user";
const USER_PROFILE_ROUTE = "/user/profile";
const UPDATE_PROFILE_ROUTE = "/user/update-profile";

const CHAT_BASE = "/chat";
const DIRECT_CHAT_ROUTE = "/chat/direct";
const GROUP_CHAT_ROUTE = "/chat/group";
const CHAT_PREFERENCE_ROUTE = (chatId: number) => `${CHAT_BASE}/${chatId}/preference`;

const THEME_BASE = "/themes";
const THEME_GET_BY_NAME = "/themes/by-name";
const THEME_GET_DEFAULT_THEME = "/themes/default";
const THEME_GET_THEME_PROPERTY_TYPE_LOOKUP = "/themes/theme-property-types";
const THEME_GET_ELEMENT_PROPERTY_TYPE_LOOKUP = "/themes/property-type-validation-constants";

const apiRoutes = {
  baseUrl: BASE_URL,

  account: {
    base: ACCOUNT_BASE,
    login: LOGIN_ROUTE,
    refresh: REFRESH_ROUTE,
    register: REGISTER_ROUTE,
    verifyOtp: VERIFY_OTP_ROUTE,
    logout: LOGOUT_ROUTE,
    checkUsername: CHECK_USERNAME_ROUTE,
    checkEmail: CHECK_EMAIL_ROUTE,
  },

  user: {
    base: USER_BASE,
    getUsers: USER_BASE,
    getCurrentUserProfile: USER_PROFILE_ROUTE,
    updateUserProfile: UPDATE_PROFILE_ROUTE,
  },

  chat: {
    base: CHAT_BASE,
    direct: DIRECT_CHAT_ROUTE,
    group: GROUP_CHAT_ROUTE,
    preference: CHAT_PREFERENCE_ROUTE,

    messages: (chatId: number) =>
      `${CHAT_BASE}/${chatId}/messages`,

    markRead: (chatId: number) =>
      `${CHAT_BASE}/${chatId}/messages/read`,

    messageById: (chatId: number, messageId: number) =>
      `${CHAT_BASE}/${chatId}/messages/${messageId}`,

    undoMessage: (chatId: number, messageId: number) =>
      `${CHAT_BASE}/${chatId}/messages/${messageId}/undo`,
  },
  theme: {
    base: THEME_BASE,
    getOrUpdateOrDeleteThemeById: (id : number)=> `${THEME_BASE}/${id}`,
    getThemeByName: (name: string)=> `${THEME_GET_BY_NAME}/${encodeURIComponent(name)}`,
    getDefaultThemeForUser: THEME_GET_DEFAULT_THEME,
    getThemePropertyTypes: THEME_GET_THEME_PROPERTY_TYPE_LOOKUP,
    getThemeElementPropertyValidationConstants: THEME_GET_ELEMENT_PROPERTY_TYPE_LOOKUP,
    setThemeAsDefault: (id: number) => `${THEME_BASE}/${id}/set-as-default`
  },

  signalR: SIGNALR_URL,
};

export default apiRoutes;