// HTTP/HTTPS transport implementation for JSON-RPC 2.0

import type { Transport, TransportResult } from "./types.mjs";
import type { JsonRpcRequest, THooks } from "../types.mjs";

/** HTTP/HTTPS transport using the native fetch API */
export class HttpTransport implements Transport {
	public constructor(private readonly hooks: THooks = {}) {}

	/** Send a JSON-RPC request over HTTP/HTTPS and return the response with timing */
	public async send(url: string, request: JsonRpcRequest): Promise<TransportResult> {
		const start = Date.now();

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			"Accept": "application/json",
		};

		await this.hooks.beforeRequest?.(request, headers);

		const res = await fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify(request),
		});

		if (!res.ok) {
			throw new Error(`HTTP ${res.status} ${res.statusText}`);
		}

		const response = await res.json() as import("../types.mjs").JsonRpcResponse;
		const durationMs = Date.now() - start;

		await this.hooks.afterResponse?.(response);

		return { response, durationMs };
	}
}
