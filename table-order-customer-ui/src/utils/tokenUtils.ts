import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  exp: number;
  sub: string;
  role: string;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};
