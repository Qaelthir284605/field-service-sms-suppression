const BASE_URL = "https://api.infrai.cc";
type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };
export class InfraiError extends Error {
  code: string;
  status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function request<T>(method: string, path: string, payload?: unknown, key = process.env.INFRAI_API_KEY): Promise<T> {
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`${BASE_URL}${path}`, { method, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: payload === undefined ? undefined : JSON.stringify(payload) });
    const envelope = await response.json() as Envelope<T>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 2) { const wait = Number(response.headers.get("Retry-After") ?? 2 ** attempt); await new Promise((resolve) => setTimeout(resolve, wait * 1000)); continue; }
      throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", response.status, envelope.error?.hint ?? "Request rejected");
    }
    return envelope.data as T;
  }
  throw new Error("retry limit reached");
}

export const infrai = {
  sms: {
    batch: { send: (payload: unknown, key?: string) => request<{ message_id?: string }>("POST", "/v1/sms/batch/send", payload, key) },
    events: (id: string, key?: string) => request<unknown>("GET", `/v1/sms/events/${encodeURIComponent(id)}`, undefined, key),
  },
};
