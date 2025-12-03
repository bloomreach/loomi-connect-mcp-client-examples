function baseFromUrl(url) {
    const trimmed = url.replace(/\/+$/, "");
    if (trimmed.endsWith("/messages")) {
        return trimmed.slice(0, -"/messages".length);
    }
    return trimmed;
}
function endpointsToTry(url) {
    const base = baseFromUrl(url);
    return [`${base}/messages`, base];
}
function pickContentType(res) {
    return (res.headers.get("content-type") || "").toLowerCase();
}
function parseSseToJson(text, preferId) {
    const events = text.split("\n\n");
    let lastJson = null;
    for (const evt of events) {
        const lines = evt.split("\n");
        const dataLines = lines.filter((l) => l.startsWith("data: "));
        if (dataLines.length === 0)
            continue;
        const dataPayload = dataLines.map((l) => l.slice(6)).join("\n");
        try {
            const obj = JSON.parse(dataPayload);
            if (obj && obj.id && String(obj.id) === preferId) {
                return obj;
            }
            lastJson = obj;
        }
        catch {
            // ignore parse errors on intermediate frames
        }
    }
    return lastJson;
}
export async function callSearchOverHttp(url, headers, params) {
    const requestId = `search-${Date.now()}`;
    const payload = {
        jsonrpc: "2.0",
        id: requestId,
        method: "tools/call",
        params: {
            name: "search",
            arguments: { params },
        },
    };
    let lastErr = null;
    for (const ep of endpointsToTry(url)) {
        try {
            const res = await fetch(ep, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    accept: "application/json, text/event-stream",
                    ...headers,
                },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const ct = pickContentType(res);
                if (ct.includes("application/json")) {
                    return await res.json();
                }
                if (ct.includes("text/event-stream")) {
                    const text = await res.text();
                    const parsed = parseSseToJson(text, requestId);
                    if (parsed)
                        return parsed;
                    throw new Error("SSE stream parsed but no JSON message found");
                }
                const text = await res.text().catch(() => "");
                throw new Error(`Unexpected content-type ${ct || "<none>"} at ${ep}: ${text}`);
            }
            const text = await res.text().catch(() => "");
            lastErr = new Error(`HTTP ${res.status} at ${ep}: ${text || res.statusText}`);
            if (![404, 405].includes(res.status))
                break;
        }
        catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error("Request failed");
}
