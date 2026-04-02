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

// ── Theme system ──────────────────────────────────────────────────────────────

/** Inline text style — property names match ink TextProps for direct spreading onto <Text> */
export interface TextStyle {
  color?: string;
  backgroundColor?: string;
  dimColor?: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  inverse?: boolean;
}

/** Custom box-drawing character set — mirrors cli-boxes BoxStyle */
export interface BorderChars {
  topLeft: string;
  top: string;
  topRight: string;
  right: string;
  bottomRight: string;
  bottom: string;
  bottomLeft: string;
  left: string;
}

/** Border definition: preset name or custom chars, plus optional coloring */
export interface BorderDef {
  /** ink borderStyle preset (e.g. "single", "round") or a custom BorderChars object */
  style: string | BorderChars;
  color?: string;
  /** Used for popup overlays to prevent underlying content from bleeding through */
  backgroundColor?: string;
}

/** Complete application theme */
export interface Theme {
  infoBar: {
    logo: TextStyle;
    url: TextStyle;
    method: TextStyle;
    loading: TextStyle;
    /** Background color of the header bar */
    backgroundColor?: string;
  };
  /** Horizontal separator below the info bar */
  separator: BorderDef;
  /** Vertical divider between the params and response panels */
  panelDivider: BorderDef;
  requestPanel: {
    titleActive: TextStyle;
    titleInactive: TextStyle;
    hint: TextStyle;
  };
  paramsEditor: {
    /** Block cursor highlight */
    cursor: TextStyle;
    /** Placeholder shown when params are empty */
    empty: TextStyle;
  };
  responsePanel: {
    title: TextStyle;
    duration: TextStyle;
    transportError: TextStyle;
    rpcError: TextStyle;
    rpcErrorData: TextStyle;
    successResult: TextStyle;
    empty: TextStyle;
  };
  statusBar: {
    historyMode: TextStyle;
    loading: TextStyle;
    error: TextStyle;
    paramsActive: TextStyle;
    default: TextStyle;
  };
  historyPopup: {
    border: BorderDef;
    header: TextStyle;
    successIcon: TextStyle;
    errorIcon: TextStyle;
    /** Entry highlighted by the cursor */
    selectedMethod: TextStyle;
    /** Entry that is the current active (loaded) request */
    activeMethod: TextStyle;
    inactiveMethod: TextStyle;
    meta: TextStyle;
    empty: TextStyle;
  };
  methodPopup: {
    border: BorderDef;
    header: TextStyle;
    inputBorderFocused: BorderDef;
    inputBorderUnfocused: BorderDef;
    cursor: TextStyle;
    selectedItem: TextStyle;
    unselectedItem: TextStyle;
    empty: TextStyle;
  };
  requestPickerPopup: {
    border: BorderDef;
    divider: BorderDef;
    header: TextStyle;
    /** Currently highlighted item in the list */
    selectedItem: TextStyle;
    unselectedItem: TextStyle;
    /** Preview area: method label */
    previewMethod: TextStyle;
    /** Preview area: params text */
    previewParams: TextStyle;
    /** Preview area: section labels ("Method:", "Params:") */
    previewLabel: TextStyle;
    empty: TextStyle;
    /** Dirty-state indicator shown in the top info bar */
    dirtyIndicator: TextStyle;
  };
  commandLine: {
    /** The `:` prompt character */
    prompt: TextStyle;
    /** Typed command text */
    inputText: TextStyle;
    /** Block cursor */
    cursor: TextStyle;
    /** Border of the completion popup */
    completionBorder: BorderDef;
    /** Highlighted command name */
    selectedName: TextStyle;
    /** Highlighted command description */
    selectedDescription: TextStyle;
    /** Unhighlighted command name */
    unselectedName: TextStyle;
    /** Unhighlighted command description */
    unselectedDescription: TextStyle;
  };
}

// ── Request files ─────────────────────────────────────────────────────────────

/** A request saved to a *.rpcon.yaml file on disk */
export interface RequestFile {
  /** Absolute path to the file */
  filePath: string;
  /** Display name — from the `name` field in YAML, or derived from filename */
  name: string;
  /** JSON-RPC method name */
  method: string;
  /** Params serialised as a YAML string (empty string = no params) */
  params: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** User-supplied extension hooks loaded from hooks.rpcon.mjs in the working directory */
export type THooks = {
	baseUrl?: string | (() => string);
	/** Human-readable API label shown in the header instead of the raw URL */
	apiName?: string | (() => string);
	beforeRequest?: (request: JsonRpcRequest, headers: Record<string, string>) => void | Promise<void>;
	afterResponse?: (response: Readonly<JsonRpcResponse>) => void | Promise<void>;
};

// ── Command line ──────────────────────────────────────────────────────────────

/** A single command available in the vim-style command line */
export interface CommandDef {
  /** Primary name typed after `:` */
  name: string;
  /** Short description shown in the completion popup */
  description: string;
}

/** A single row in the command-line completion popup */
export interface CompletionItem {
  /** Main label — command name or argument value */
  primary: string;
  /** Optional secondary text — command description or contextual info */
  secondary?: string;
}

// ── Application state ─────────────────────────────────────────────────────────

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
  /** The request file currently loaded (null = no file loaded) */
  loadedFile: RequestFile | null;
}
