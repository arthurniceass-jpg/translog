import { API_URL } from "./http";
import { remote } from "./remote";
import { local } from "./local";

/**
 * Escolhe o adaptador: com VITE_API_URL usa a API Spring Boot;
 * sem ela, roda em modo demo (localStorage). Mesma interface nos dois.
 */
export const api = API_URL ? remote : local;
export { ApiError } from "./errors";
