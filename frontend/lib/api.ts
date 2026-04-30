// Cliente HTTP centralizado para la API REST del backend NestJS
// Base URL configurable desde variable de entorno NEXT_PUBLIC_API_URL

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as ApiErrorBody;
    if (Array.isArray(data?.message)) return data.message.join(", ");
    if (typeof data?.message === "string" && data.message.trim().length > 0) return data.message;
    if (typeof data?.error === "string" && data.error.trim().length > 0) return data.error;
    return fallback;
  } catch {
    // Si no hay JSON (o está vacío), devolvemos un fallback seguro.
    return fallback;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`);
  if (!res.ok) {
    const msg = await extractErrorMessage(res, `GET ${path} failed: ${res.status}`);
    throw new Error(msg);
  }
  const json = await res.json();
  return json.data as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, `POST ${path} failed: ${res.status}`);
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data as T;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, `PUT ${path} failed: ${res.status}`);
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data as T;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, `PATCH ${path} failed: ${res.status}`);
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, { method: "DELETE" });

  if (!res.ok) {
    const msg = await extractErrorMessage(res, `DELETE ${path} failed: ${res.status}`);
    throw new Error(msg);
  }

  // Algunos endpoints podrían no devolver body; lo manejamos sin romper.
  try {
    const json = await res.json();
    return json.data as T;
  } catch {
    return undefined as T;
  }
}