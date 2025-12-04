import { env } from "node:process";
export const DEFAULT_URL = env.LOOMI_MCP_URL || "https://mcp.bloomreach.com/mcp";
export function parseArgs(raw) {
    const args = { url: DEFAULT_URL, q: null, rows: 12, facet: false, extra: {} };
    for (let i = 2; i < raw.length; i++) {
        const token = raw[i];
        if (token === "--url") {
            args.url = raw[++i] || args.url;
        }
        else if (token === "--q") {
            args.q = raw[++i] || null;
        }
        else if (token === "--rows") {
            const n = Number(raw[++i]);
            if (!Number.isFinite(n) || n < 0)
                throw new Error("--rows must be a non-negative number");
            args.rows = n;
        }
        else if (token === "--facet") {
            args.facet = true;
        }
        else if (token === "--arg") {
            const pair = raw[++i];
            if (!pair || !pair.includes("="))
                throw new Error("Invalid --arg format, expected KEY=VALUE");
            const [k, vRaw] = pair.split("=", 2);
            const kTrim = k.trim();
            const vTrim = vRaw.trim();
            if (vTrim.includes(",")) {
                args.extra[kTrim] = vTrim.split(",").map((s) => s.trim());
            }
            else {
                args.extra[kTrim] = vTrim;
            }
        }
    }
    return args;
}
export function buildHeaders() {
    const headers = {};
    const accountId = env.ACCOUNT_ID || env.LOOMI_ACCOUNT_ID;
    const domainKey = env.DOMAIN_KEY || env.LOOMI_DOMAIN_KEY;
    const apiKey = env.API_KEY || env.LOOMI_API_KEY;
    if (accountId)
        headers["account_id"] = accountId;
    if (domainKey)
        headers["domain_key"] = domainKey;
    if (apiKey)
        headers["x-api-key"] = apiKey;
    return headers;
}
export function prepareArguments({ q, rows, facet, extra }) {
    if (!q || q.trim() === "*" || q.trim().length === 0) {
        throw new Error("q must be non-empty and not equal to '*'");
    }
    const args = { q: q.trim(), rows, facet: facet ? "true" : "false" };
    if (extra && typeof extra === "object") {
        const merged = { ...extra };
        if (typeof merged.facet === "boolean") {
            merged.facet = merged.facet ? "true" : "false";
        }
        Object.assign(args, merged);
    }
    return args;
}
