// JSON-RPC 2.0 client

import type { Transport } from "../transport/types.mjs";
import type { JsonRpcRequest, JsonRpcParams, HistoryEntry } from "../types.mjs";

/** JSON-RPC 2.0 client managing request lifecycle and history */
export class RpcClient {
  private nextId: number = 1;
  private nextEntryId: number = 1;

  public constructor(private readonly transport: Transport) {}

  /** Build and send a JSON-RPC 2.0 request, returning a completed HistoryEntry */
  public async call(
    url: string,
    method: string,
    params: JsonRpcParams | undefined,
  ): Promise<HistoryEntry> {
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: this.nextId++,
      method,
      ...(params !== undefined && { params }),
    };

    const entry: HistoryEntry = {
      id: this.nextEntryId++,
      timestamp: new Date(),
      url,
      request,
      response: null,
      error: null,
      durationMs: null,
    };

    try {
      const { response, durationMs } = await this.transport.send(url, request);
      entry.response = response;
      entry.durationMs = durationMs;
    } catch (err) {
      entry.error = err instanceof Error ? err.message : String(err);
    }

    return entry;
  }
}
