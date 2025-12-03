import { env } from "node:process";

export const DEFAULT_URL = env.LOOMI_MCP_URL || "https://mcp.bloomreach.com/mcp";

export interface RawArgs {
  url: string;
  q: string | null;
  rows: number;
  facet: boolean;
  extra: Record<string, string | string[]>;
}

export function parseArgs(raw: string[]): RawArgs {
  const args: RawArgs = { url: DEFAULT_URL, q: null, rows: 12, facet: false, extra: {} };
  for (let i = 2; i < raw.length; i++) {
    const token = raw[i];
    if (token === "--url") {
      args.url = raw[++i] || args.url;
    } else if (token === "--q") {
      args.q = raw[++i] || null;
    } else if (token === "--rows") {
      const n = Number(raw[++i]);
      if (!Number.isFinite(n) || n < 0) throw new Error("--rows must be a non-negative number");
      args.rows = n;
    } else if (token === "--facet") {
      args.facet = true;
    } else if (token === "--arg") {
      const pair = raw[++i];
      if (!pair || !pair.includes("=")) throw new Error("Invalid --arg format, expected KEY=VALUE");
      const [k, vRaw] = pair.split("=", 2);
      const kTrim = k.trim();
      const vTrim = vRaw.trim();
      if (vTrim.includes(",")) {
        args.extra[kTrim] = vTrim.split(",").map((s) => s.trim());
      } else {
        args.extra[kTrim] = vTrim;
      }
    }
  }
  return args;
}

export type HeadersMap = Record<string, string>;

export function buildHeaders(): HeadersMap {
  const headers: HeadersMap = {};
  const accountId = env.ACCOUNT_ID || env.LOOMI_ACCOUNT_ID;
  const domainKey = env.DOMAIN_KEY || env.LOOMI_DOMAIN_KEY;
  const authKey = env.AUTH_KEY || env.LOOMI_AUTH_KEY;
  if (accountId) headers["account_id"] = accountId;
  if (domainKey) headers["domain_key"] = domainKey;
  if (authKey) headers["auth_key"] = authKey;
  return headers;
}

export interface SearchParamsArguments {
  q: string;
  rows: number;
  facet: string;
  [key: string]: string | number | string[];
}

export function prepareArguments({ q, rows, facet, extra }: RawArgs): SearchParamsArguments {
  if (!q || q.trim() === "*" || q.trim().length === 0) {
    throw new Error("q must be non-empty and not equal to '*'");
  }
  const args: SearchParamsArguments = { q: q.trim(), rows, facet: facet ? "true" : "false" };
  if (extra && typeof extra === "object") {
    const merged: Record<string, string | string[]> = { ...extra };
    if (typeof (merged as any).facet === "boolean") {
      (merged as any).facet = (merged as any).facet ? "true" : "false";
    }
    Object.assign(args, merged);
  }
  return args;
}


