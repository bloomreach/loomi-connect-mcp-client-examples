# Loomi Connect — Node.js MCP Client (HTTP/SSE)

Node.js client for the Loomi MCP server using `@modelcontextprotocol/sdk`. It connects over HTTP/SSE via the SDK’s HTTP client transport, sends credentials as headers, and calls the `search` tool.

## Requirements

- Node 18+
- Install deps:

```bash
cd client/nodejs
npm install
```

## Environment

- `LOOMI_MCP_URL` (default: `http://mcp.bloomreach.com/mcp`)
- `ACCOUNT_ID` — required
- `DOMAIN_KEY` — required
- `AUTH_KEY` — optional unless the server enforces it

Headers sent during initialize/requests:
- `account_id`, `domain_key`, `auth_key`

## Usage

```bash
cd client/nodejs

export ACCOUNT_ID=your_account
export DOMAIN_KEY=your_domain
export AUTH_KEY=your_auth   # optional if server allows missing auth

npm run start -- --q "fish" --rows 12 --facet
```

Additional arguments via repeated `--arg KEY=VALUE`:

```bash
npm run start -- \
  --q "chair" \
  --arg fq=category:living \
  --arg fq=color:black \
  --arg fl=url,pid,title,price
```

Notes:
- `facet` is coerced to a string (`"true"`/`"false"`) to match server validation.
- Tool arguments are nested under `params` per the server's `search(params: SearchParams, ...)` signature.
- This client uses the SDK’s HTTP/SSE transport and requires a version of `@modelcontextprotocol/sdk` that exports an HTTP client transport (e.g., `HttpClientTransport` or `StreamableHttpClientTransport`). Update to the latest version if needed.

## Reference

- `@modelcontextprotocol/sdk` on npm: [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

