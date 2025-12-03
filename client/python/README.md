# Loomi Connect — Python MCP Client (python-sdk, SSE)

Minimal standalone Python client that connects to the Loomi MCP server over HTTP/SSE using the official `modelcontextprotocol/python-sdk` and calls the `search` tool for Bloomreach Discovery.

## Requirements

- Python 3.11+
- Install deps:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r client/python/requirements.txt
```

## Environment

- `LOOMI_MCP_URL` (default: `http://mcp.bloomreach.com/mcp`)
- `ACCOUNT_ID` — required
- `DOMAIN_KEY` — required
- `AUTH_KEY` — optional unless the server enforces it

These are sent as headers during MCP initialize via the streamable HTTP transport:
`account_id`, `domain_key`, `auth_key`.

## Usage

```bash
# Activate venv and install requirements first (see above)

export ACCOUNT_ID=your_account
export DOMAIN_KEY=your_domain
export AUTH_KEY=your_auth   # optional if server allows missing auth

python client/python/mcp_client.py --q "fish" --rows 12 --facet
```

Additional arguments can be passed via `--arg KEY=VALUE`. For lists, use comma separation:

```bash
python client/python/mcp_client.py --q "sofa" --arg fq=category:living --arg fl=url,pid,title
```

## Examples

- Exact phrase:

```bash
python client/python/mcp_client.py --q "\"fish\"" --rows 12
```

- Multiple filter queries and custom field list:

```bash
python client/python/mcp_client.py \
  --q "chair" \
  --arg fq=category:living \
  --arg fq=color:black \
  --arg fl=url,pid,title,price
```

## Troubleshooting

- Validation error: “Field required: params”  
  Ensure the server is the Loomi MCP server and you’re calling the `search` tool. This client already wraps arguments under `params` as required by the server’s tool signature.

- Validation error: “params.facet: Input should be a valid string”  
  Pass `--facet` or set `--arg facet=true`. The client coerces the flag to `"true"`/`"false"` automatically.

- Import error: “Import mcp could not be resolved”  
  Run `pip install -r client/python/requirements.txt` in your active virtualenv.

- 401/403 from server  
  Check `ACCOUNT_ID`, `DOMAIN_KEY`, and `AUTH_KEY` environment variables.

## Notes

- The server must be running (see project root `README.md` for instructions).
- This client uses the python-sdk `mcp.client.streamable_http.streamablehttp_client` with headers and `ClientSession`.
- Headers are the simplified names preferred by the server:
  - `account_id`
  - `domain_key`
  - `auth_key`

## Reference

- Official python-sdk repository: [modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)

