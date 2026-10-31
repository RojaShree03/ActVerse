const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getToken() { return localStorage.getItem("actverse-token") || ""; }
export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}
export function saveSession(data) {
  localStorage.setItem("actverse-token", data.token);
  localStorage.setItem("actverse-user", JSON.stringify(data.user));
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem("actverse-user") || "null"); } catch { return null; }
}
export function clearSession() {
  localStorage.removeItem("actverse-token");
  localStorage.removeItem("actverse-user");
}
