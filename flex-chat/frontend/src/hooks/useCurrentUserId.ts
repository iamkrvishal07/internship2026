import { useAuthStore } from "../stores/authStore";
import { decodeJwt } from "../utils/jwtUtils";

export const useCurrentUserId = (): number | null => {
  const token = useAuthStore((state) => state.accessToken);

  if (!token) return null;

  const payload = decodeJwt(token);

  if (!payload?.sub) return null;

  return parseInt(payload.sub, 10);
};

