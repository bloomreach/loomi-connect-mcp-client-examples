from __future__ import annotations

from typing import Any, Dict

from mcp import ClientSession

# Support both historical and current symbol names in the SDK
try:
	from mcp.client.streamable_http import streamablehttp_client  # newest name
except Exception:  # pragma: no cover
	from mcp.client.streamable_http import streamable_http_client as streamablehttp_client  # fallback alias


async def run_search(url: str, headers: Dict[str, str], arguments: Dict[str, Any]) -> Any:
    """
    Use the python-sdk streamable HTTP client to call the tool with headers.
    Returns the raw CallToolResult object from the SDK.
    """
    async with streamablehttp_client(url, headers=headers) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            await session.list_tools()
            result = await session.call_tool("search", {"params": arguments})
            return result


