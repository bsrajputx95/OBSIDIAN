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

function mapIdsFromAny(json: any): string[] {
  if (!json) return [];
  if (Array.isArray(json)) {
    return json
      .map((x) => (typeof x === "string" ? x : x?.id || x?.name))
      .filter(Boolean);
  }
  if (Array.isArray(json?.data)) {
    return json.data.map((x: any) => x?.id || x?.name).filter(Boolean);
  }
  if (Array.isArray(json?.models)) {
    return json.models.map((x: any) => x?.id || x?.name).filter(Boolean);
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
      default:
        return Response.json({ error: "unsupported provider" }, { status: 400 });
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      const text = await res.text();
      return Response.json({ error: "fetch failed", provider, status: res.status, detail: text }, { status: 502 });
    }
    const json = await res.json();
    const ids = mapIdsFromAny(json);
    return Response.json({ models: ids });
  } catch (e: any) {
    return Response.json({ error: "unexpected", detail: String(e?.message ?? e) }, { status: 500 });
  }
}