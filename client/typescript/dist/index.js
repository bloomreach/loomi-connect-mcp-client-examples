#!/usr/bin/env node
/**
 * TypeScript MCP client for Loomi Connect (Bloomreach Discovery), based on @modelcontextprotocol/sdk.
 */
import { argv, exit } from "node:process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { parseArgs, buildHeaders, prepareArguments } from "./cliUtils.js";
import { getHttpTransportCtor } from "./sdkTransport.js";
import { callSearchOverHttp } from "./httpClient.js";
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
            const client = new Client({ name: "loomi-ts-client", version: "1.0.0" });
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
            // eslint-disable-next-line no-console
            console.log(result);
            // Some SDK versions do not expose a disconnect/close method on Client
            if (typeof client.disconnect === "function") {
                await client.disconnect();
            }
            else if (typeof transport.close === "function") {
                await transport.close();
            }
        }
        else {
            // Fallback: direct MCP JSON-RPC over HTTP to /messages or base
            const result = await callSearchOverHttp(args.url, headers, params);
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(result, null, 2));
        }
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err?.stack || err?.message || String(err));
        exit(1);
    }
}
void main();
