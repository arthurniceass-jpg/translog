import { ApiError } from "./errors";
import { session } from "./session";

export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/**
 * Cliente HTTP fino sobre fetch: base URL, JSON, Bearer token e
 * conversão do corpo de erro da API ({message, fieldErrors}) em ApiError.
 */
export async function http(path, { method = "GET", body, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = session.getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let resp;
  try {
    resp = await fetch(API_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
  }

  if (resp.status === 204) return null;

  let data = null;
  try {
    data = await resp.json();
  } catch {
    /* corpo vazio ou não-JSON */
  }

  if (!resp.ok) {
    if (resp.status === 401 && auth && token) session.notifyUnauthorized();
    throw new ApiError(data?.message || `Erro ${resp.status} ao falar com o servidor.`, {
      status: resp.status,
      fieldErrors: data?.fieldErrors || {},
    });
  }
  return data;
}
