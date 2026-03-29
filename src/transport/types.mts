// Transport layer interface definitions

import type { JsonRpcRequest, JsonRpcResponse } from "../types.mjs";

/** Common interface for all JSON-RPC transports */
export interface Transport {
  /** Send a JSON-RPC request and return the response */
  send(url: string, request: JsonRpcRequest): Promise<TransportResult>;
}

/** Result of a transport send operation */
export interface TransportResult {
  response: JsonRpcResponse;
  durationMs: number;
}
