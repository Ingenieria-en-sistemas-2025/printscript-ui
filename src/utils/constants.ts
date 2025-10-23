export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL ?? "http://localhost:5173/login";
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080/api";
export const AUTH0_USERNAME = import.meta.env.VITE_AUTH0_USERNAME ?? "";
export const AUTH0_PASSWORD = import.meta.env.VITE_AUTH0_PASSWORD ?? "";
export const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE ?? "";
export const AUTH0_SCOPE = import.meta.env.VITE_AUTH0_SCOPE ?? "openid profile email";
