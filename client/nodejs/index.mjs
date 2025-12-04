#!/usr/bin/env node
/**
 * Node.js MCP client for Loomi Connect (Bloomreach Discovery), based on @modelcontextprotocol/sdk.
 */
import { argv, exit } from "node:process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { parseArgs, buildHeaders, prepareArguments } from "./src/cliUtils.mjs";
import { getHttpTransportCtor } from "./src/sdkTransport.mjs";
import { callSearchOverHttp } from "./src/httpClient.mjs";

async function main() {
  try {
    const args = parseArgs(argv);
    const headers = buildHeaders();
    if (!headers.account_id || !headers.domain_key || !headers["x-api-key"]) {
      throw new Error("ACCOUNT_ID, DOMAIN_KEY, and API_KEY environment variables are required.");
    }
    const params = prepareArguments(args);

    const HttpTransportCtor = await getHttpTransportCtor();
    if (HttpTransportCtor) {
      // Use SDK HTTP/SSE transport
      const client = new Client({ name: "loomi-node-client", version: "1.0.0" });
      const transport = new HttpTransportCtor({
        url: args.url,
        headers,
      });
      await client.connect(transport);
      await client.listTools(); // optional sanity check
      const result = await client.callTool({
        name: "search",
        arguments: { params },
      });
      console.log(result);
      await client.disconnect();
    } else {
      // Fallback: direct MCP JSON-RPC over HTTP to /messages
      const result = await callSearchOverHttp(args.url, headers, params);
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.error(err?.stack || err?.message || String(err));
    exit(1);
  }
}

main();

