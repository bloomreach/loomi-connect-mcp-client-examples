function dynamicImport(path) {
    // Use Function constructor to avoid TypeScript module resolution checks for optional modules
    // eslint-disable-next-line no-new-func
    const importer = new Function("p", "return import(p)");
    return importer(path).catch(() => null);
}
export async function getHttpTransportCtor() {
    let HttpTransportCtor = null;
    const tryPaths = [
        "@modelcontextprotocol/sdk/client/http.js",
        "@modelcontextprotocol/sdk/client/streamable-http.js",
    ];
    for (const p of tryPaths) {
        const mod = await dynamicImport(p);
        if (mod && (mod.HttpClientTransport || mod.StreamableHttpClientTransport)) {
            HttpTransportCtor = mod.HttpClientTransport || mod.StreamableHttpClientTransport;
            break;
        }
    }
    return HttpTransportCtor;
}
