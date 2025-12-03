from __future__ import annotations

import argparse
import os
from typing import Any, Dict, Optional

DEFAULT_URL = os.getenv("LOOMI_MCP_URL", "https://mcp.bloomreach.com/mcp")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Python MCP SSE client for Bloomreach Discovery search"
    )
    parser.add_argument(
        "--url",
        default=DEFAULT_URL,
        help="MCP endpoint base URL (e.g., https://mcp.bloomreach.com/mcp).",
    )
    parser.add_argument(
        "--account-id",
        default=os.getenv("ACCOUNT_ID") or os.getenv("LOOMI_ACCOUNT_ID"),
        help="Bloomreach account id (env: ACCOUNT_ID)",
    )
    parser.add_argument(
        "--domain-key",
        default=os.getenv("DOMAIN_KEY") or os.getenv("LOOMI_DOMAIN_KEY"),
        help="Bloomreach domain key (env: DOMAIN_KEY)",
    )
    parser.add_argument(
        "--auth-key",
        default=os.getenv("AUTH_KEY") or os.getenv("LOOMI_AUTH_KEY"),
        help="Bloomreach auth key (optional unless server requires; env: AUTH_KEY)",
    )
    parser.add_argument(
        "--q",
        required=True,
        help="Search query string (must not be '*')",
    )
    parser.add_argument(
        "--rows",
        type=int,
        default=12,
        help="Number of rows to return (default: %(default)s)",
    )
    parser.add_argument(
        "--facet",
        action="store_true",
        help="Enable faceting (default: disabled)",
    )
    parser.add_argument(
        "--arg",
        action="append",
        metavar="KEY=VALUE",
        help="Additional search argument(s), e.g. --arg fq=category:chair. Can be repeated.",
    )
    return parser.parse_args()


def build_headers(
    account_id: Optional[str],
    domain_key: Optional[str],
    auth_key: Optional[str],
) -> Dict[str, str]:
    headers: Dict[str, str] = {}
    if account_id:
        headers["account_id"] = account_id
    if domain_key:
        headers["domain_key"] = domain_key
    if auth_key:
        headers["auth_key"] = auth_key
    return headers


def parse_key_value_pairs(pairs: Optional[list[str]]) -> Dict[str, Any]:
    if not pairs:
        return {}
    parsed: Dict[str, Any] = {}
    for item in pairs:
        if "=" not in item:
            raise ValueError(f"Invalid --arg format, expected KEY=VALUE, got: {item}")
        key, value = item.split("=", 1)
        key = key.strip()
        value = value.strip()
        if "," in value:
            parsed[key] = [v.strip() for v in value.split(",")]
        else:
            parsed[key] = value
    return parsed


def prepare_search_arguments(
    query: str,
    rows: int,
    facet: bool,
    extra_args: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    if not query or query.strip() == "*":
        raise ValueError("Query q must be a non-empty value other than '*'")
    arguments: Dict[str, Any] = {
        "q": query.strip(),
        "rows": rows,
        "facet": "true" if facet else "false",
    }
    if extra_args:
        merged = dict(extra_args)
        if "facet" in merged and isinstance(merged["facet"], bool):
            merged["facet"] = "true" if merged["facet"] else "false"
        arguments.update(merged)
    return arguments


