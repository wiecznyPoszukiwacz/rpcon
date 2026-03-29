// Central type and interface definitions for the project

/** JSON-RPC 2.0 request object */
export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number | string | null;
  method: string;
  params?: JsonRpcParams;
}

/** JSON-RPC 2.0 response object */
export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: unknown;
  error?: JsonRpcError;
}

/** JSON-RPC 2.0 error object */
export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

/** Allowed JSON-RPC parameter types */
export type JsonRpcParams = Record<string, unknown> | unknown[];

/** A single entry in the request history */
export interface HistoryEntry {
  id: number;
  timestamp: Date;
  url: string;
  request: JsonRpcRequest;
  response: JsonRpcResponse | null;
  error: string | null;
  durationMs: number | null;
}

/** Global application state */
export interface AppState {
  /** JSON-RPC endpoint URL — read-only, sourced from CLI argv */
  url: string;
  method: string;
  /** Params as YAML string */
  params: string;
  history: HistoryEntry[];
  activeEntry: HistoryEntry | null;
  loading: boolean;
  error: string | null;
  /** Whether the history popup overlay is visible */
  showHistory: boolean;
}
