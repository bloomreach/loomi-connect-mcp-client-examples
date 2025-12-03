// Resolve an HTTP/SSE client transport from @modelcontextprotocol/sdk, if available
export async function getHttpTransportCtor() {
  let HttpTransportCtor = null;
  try {
    const mod = await import("@modelcontextprotocol/sdk/client/http.js");
    HttpTransportCtor = mod.HttpClientTransport || mod.StreamableHttpClientTransport || null;
  } catch {}
  if (!HttpTransportCtor) {
    try {
      const mod = await import("@modelcontextprotocol/sdk/client/streamable-http.js");
      HttpTransportCtor = mod.StreamableHttpClientTransport || null;
    } catch {}
  }
  return HttpTransportCtor;
}


