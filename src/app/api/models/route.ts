import { NextRequest } from "next/server";

export const runtime = "nodejs";

type Provider =
  | "openai"
  | "anthropic"
  | "gemini"
  | "xai"
  | "mistral"
  | "groq"
  | "cohere"
  | "together";

type ModelListResponse = Record<string, unknown>;

function mapIdsFromAny(json: ModelListResponse | null): string[] {
  if (!json) return [];
  if (Array.isArray(json)) {
    return json
      .map((x) => (typeof x === "string" ? x : (x as { id?: string; name?: string })?.id || (x as { id?: string; name?: string })?.name))
      .filter((s): s is string => typeof s === "string" && s.length > 0);
  }
  if (Array.isArray(json?.data)) {
    return (json.data as Array<{ id?: string; name?: string }>).map((x) => x?.id || x?.name).filter((s): s is string => typeof s === "string" && s.length > 0);
  }
  if (Array.isArray(json?.models)) {
    return (json.models as Array<{ id?: string; name?: string }>).map((x) => x?.id || x?.name).filter((s): s is string => typeof s === "string" && s.length > 0);
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = (await req.json()) as { provider: Provider; apiKey?: string };
    if (!provider) return Response.json({ error: "provider required" }, { status: 400 });

    let url = "";
    let headers: Record<string, string> = {};

    switch (provider) {
      case "openai":
        url = "https://api.openai.com/v1/models";
        headers = { Authorization: `Bearer ${apiKey ?? ""}` };
        break;
      case "anthropic":
        url = "https://api.anthropic.com/v1/models";
        headers = { "x-api-key": apiKey ?? "", "anthropic-version": "2023-06-01" };
        break;
      case "gemini":
        url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey ?? ""}`;
        break;
      case "mistral":
        url = "https://api.mistral.ai/v1/models";
        headers = { Authorization: `Bearer ${apiKey ?? ""}` };
        break;
      case "groq":
        url = "https://api.groq.com/openai/v1/models";
        headers = { Authorization: `Bearer ${apiKey ?? ""}` };
        break;
      case "cohere":
        url = "https://api.cohere.ai/v1/models";
        headers = { Authorization: `Bearer ${apiKey ?? ""}` };
        break;
      case "together":
        url = "https://api.together.xyz/v1/models";
        headers = { Authorization: `Bearer ${apiKey ?? ""}` };
        break;
      case "xai":
        url = "https://api.x.ai/v1/models";
        headers = { Authorization: `Bearer ${apiKey ?? ""}` };
        break;
      default:
        return Response.json({ error: "unsupported provider" }, { status: 400 });
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      const text = await res.text();
      return Response.json({ error: "fetch failed", provider, status: res.status, detail: text }, { status: 502 });
    }
    const json = await res.json() as ModelListResponse;
    const ids = mapIdsFromAny(json);
    return Response.json({ models: ids });
  } catch (e) {
    return Response.json({ error: "unexpected", detail: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}