#!/usr/bin/env python3
"""
Standalone Python MCP client using the official python-sdk for Loomi Connect Bloomreach Discovery.

This client connects over HTTP/SSE and calls the `search` tool.
Credentials are sent as HTTP headers during the MCP initialize handshake.
"""
from __future__ import annotations

import asyncio
from lib.cli_utils import (
    parse_args,
    build_headers,
    parse_key_value_pairs,
    prepare_search_arguments,
)
from lib.sdk_client import run_search


async def _noop() -> None:
    return None

def main() -> None:
    ns = parse_args()
    headers = build_headers(ns.account_id, ns.domain_key, ns.auth_key)

    # Basic validation mirroring server expectations
    if "account_id" not in headers or "domain_key" not in headers:
        raise SystemExit(
            "Both --account-id and --domain-key (or ACCOUNT_ID/DOMAIN_KEY env vars) are required."
        )
    if ns.q.strip() == "*":
        raise SystemExit("Query q must not equal '*'.")

    extra = parse_key_value_pairs(ns.arg)
    arguments = prepare_search_arguments(
        query=ns.q, rows=ns.rows, facet=ns.facet, extra_args=extra
    )
    result = asyncio.run(run_search(url=ns.url, headers=headers, arguments=arguments))
    # Print raw result JSON
    print(result)


if __name__ == "__main__":
    main()


