import { useAuthStore } from "../stores/authStore";


interface JwtPayload {
  sub: string; 
  name: string; 
  email: string;
  role: string;
  jti: string;
  exp: number;
  iss: string;
  aud: string;
}

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload);
    const parsed = JSON.parse(decoded);

    return parsed;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const getUserIdFromToken = (token: string | null): number | null => {
  if (!token) return null;
  
  const payload = decodeJwt(token);
  if (!payload || !payload.sub) return null;
  
  return parseInt(payload.sub, 10);
};

export const getUsernameFromToken = (token: string | null): string | null => {
  if (!token) return null;
  
  const payload = decodeJwt(token);
  return payload?.name || null;
};

export const getEmailFromToken = (token: string | null): string | null => {
  if (!token) return null;
  
  const payload = decodeJwt(token);
  return payload?.email || null;
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  
  return payload.exp * 1000 < Date.now();
};

export const getTokenExpiryDate = (token: string | null): Date | null => {
  if (!token) return null;
  
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return null;
  
  return new Date(payload.exp * 1000);
};

export const getCurrentUserId = (): number | string | null => {
  const token = useAuthStore.getState().accessToken;
  if (!token) return null;
  
  const payload = decodeJwt(token);
  if (!payload || !payload.sub) return null;
  
  return parseInt(payload.sub, 10);
};