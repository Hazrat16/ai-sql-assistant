import { getApiBaseUrl } from "./config";
import type {
  ExecuteQueryRequest,
  ExecuteQueryResponse,
  NaturalQueryRequest,
  NaturalQueryResponse,
  SchemaResponse,
} from "./types";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON response from API");
  }
}

function buildError(res: Response, body: unknown): Error {
  const msg =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof (body as { message?: string }).message === "string"
      ? (body as { message: string }).message
      : typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as { error?: string }).error === "string"
        ? (body as { error: string }).error
        : res.statusText || "Request failed";
  return new Error(msg);
}

export async function postNaturalQuery(
  body: NaturalQueryRequest,
): Promise<NaturalQueryResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJson<NaturalQueryResponse & { message?: string }>(
    res,
  );
  if (!res.ok) throw buildError(res, data);
  return data;
}

export async function getSchema(): Promise<SchemaResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/schema`, { method: "GET" });
  const data = await parseJson<SchemaResponse>(res);
  if (!res.ok) throw buildError(res, data);
  return data;
}

export async function postExecuteQuery(
  body: ExecuteQueryRequest,
): Promise<ExecuteQueryResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJson<ExecuteQueryResponse>(res);
  if (!res.ok) throw buildError(res, data);
  return data;
}
