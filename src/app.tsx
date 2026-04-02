// Main application component

import React, { useState, useCallback, useMemo } from "react";
import { Box, Text, useInput, useApp, useStdin, useStdout } from "ink";
import { spawnSync } from "child_process";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import { HistoryPopup } from "./components/HistoryPopup.js";
import { MethodPopup } from "./components/MethodPopup.js";
import { RequestPanel } from "./components/RequestPanel.js";
import { ResponsePanel } from "./components/ResponsePanel.js";
import { StatusBar } from "./components/StatusBar.js";
import { HelpPopup } from "./components/HelpPopup.js";
import { RequestPickerPopup } from "./components/RequestPickerPopup.js";
import { RpcClient } from "./rpc/client.mjs";
import { HttpTransport } from "./transport/http.mjs";
import { yamlToParams, valueToYaml } from "./utils/yaml.mjs";
import {
  cursorLeft, cursorRight, cursorUp, cursorDown,
  insertAt, deleteBackward, deleteForward,
} from "./utils/cursor.mjs";
import { scanRequestFiles, saveRequestFile, saveRequestFileAs } from "./utils/requestFiles.mjs";
import { filterCommands, resolveCommand } from "./commands.mjs";
import type { CompletionItem } from "./types.mjs";
import type { AppState, Theme, THooks, RequestFile } from "./types.mjs";
import { ThemeProvider } from "./ThemeContext.js";
import { ayuMirageTheme } from "./theme.mjs";
import { CommandCompletionPopup } from "./components/CommandCompletionPopup.js";

interface AppProps {
  /** JSON-RPC endpoint URL from CLI argv */
  url: string;
  /** Visual theme; defaults to defaultTheme when omitted */
  theme?: Theme;
  /** Extension hooks loaded from hooks.rpcon.mjs in the working directory */
  hooks?: THooks;
}

/** Resolve a hooks string-or-function field to a plain string */
function resolveHookString(val: string | (() => string) | undefined): string | undefined {
  if (val === undefined) return undefined;
  return typeof val === "function" ? val() : val;
}

/** Root application component managing global state and keyboard navigation */
export function App({ url, theme = ayuMirageTheme, hooks: initialHooks = {} }: AppProps): React.ReactElement {
  const [activeHooks, setActiveHooks] = useState<THooks>(initialHooks);
  const client = useMemo(() => new RpcClient(new HttpTransport(activeHooks)), [activeHooks]);
  const { exit } = useApp();
  const { setRawMode } = useStdin();
  const { stdout } = useStdout();

  const [state, setState] = useState<AppState>({
    url,
    method: "",
    params: "",
    history: [],
    activeEntry: null,
    loading: false,
    error: null,
    showHistory: false,
    loadedFile: null,
  });

  // History popup navigation
  const [historyIndex, setHistoryIndex] = useState(0);

  // Method popup state
  const [showMethod, setShowMethod] = useState(false);
  const [methodQuery, setMethodQuery] = useState("");
  const [methodField, setMethodField] = useState<"input" | "list">("input");
  const [methodListIndex, setMethodListIndex] = useState(0);

  // Params editor state
  const [paramsActive, setParamsActive] = useState(false);
  const [paramsCursor, setParamsCursor] = useState(0);

  // Quit confirmation state
  const [confirmQuit, setConfirmQuit] = useState(false);

  // Request picker popup state
  const [requestFiles, setRequestFiles] = useState<RequestFile[]>(() =>
    scanRequestFiles(process.cwd()),
  );
  const [showRequestPicker, setShowRequestPicker] = useState(false);
  const [pickerIndex, setPickerIndex] = useState(0);

  // Help hints toggle
  const [showHelp, setShowHelp] = useState(false);

  // Vim-style command line state
  const [commandMode, setCommandMode] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [commandSuggestionIndex, setCommandSuggestionIndex] = useState(0);

  /** Whether current method/params differ from the loaded file */
  const isDirty = useMemo<boolean>(() => {
    if (state.loadedFile === null) return false;
    return (
      state.method !== state.loadedFile.method ||
      state.params.trim() !== state.loadedFile.params.trim()
    );
  }, [state.method, state.params, state.loadedFile]);

  /** All unique method names from history */
  const allMethods = useMemo(
    () => [...new Set(state.history.map(e => e.request.method))],
    [state.history],
  );

  /** Methods filtered by current popup query */
  const filteredMethods = useMemo(
    () => allMethods.filter(m => m.toLowerCase().includes(methodQuery.toLowerCase())),
    [allMethods, methodQuery],
  );

  /** Unique method names from all scanned request files */
  const allFilesMethods = useMemo(
    () => [...new Set(requestFiles.map(f => f.method).filter(m => m !== ""))],
    [requestFiles],
  );

  /** Active completions — command list or argument values depending on input */
  const completions = useMemo<CompletionItem[]>(() => {
    const hasArg = commandInput.includes(" ");
    if (!hasArg) {
      return filterCommands(commandInput).map(c => ({ primary: c.name, secondary: c.description }));
    }
    const cmdPart = commandInput.split(/\s+/)[0] ?? "";
    const argPart = commandInput.slice(commandInput.indexOf(" ") + 1);
    const resolved = resolveCommand(cmdPart);
    if (resolved === "load") {
      return requestFiles
        .filter(f => f.name.toLowerCase().startsWith(argPart.toLowerCase()))
        .map(f => ({ primary: f.name, secondary: f.method }));
    }
    if (resolved === "method") {
      return allFilesMethods
        .filter(m => m.toLowerCase().startsWith(argPart.toLowerCase()))
        .map(m => ({ primary: m }));
    }
    return [];
  }, [commandInput, requestFiles, allFilesMethods]);

  /** Spawn nvim with a temp file; returns edited content or null on error */
  const spawnNvim = useCallback((content: string, ext: string, readonly: boolean): string | null => {
    const tmpFile = `${os.tmpdir()}/rpcon-${crypto.randomUUID()}.${ext}`;
    fs.writeFileSync(tmpFile, content, "utf-8");
    setRawMode(false);
    const result = spawnSync("nvim", readonly ? ["-R", tmpFile] : [tmpFile], { stdio: "inherit" });
    setRawMode(true);
    if (result.error !== undefined) {
      setState(s => ({ ...s, error: `nvim: ${result.error!.message}` }));
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
      return null;
    }
    try { return fs.readFileSync(tmpFile, "utf-8"); } catch { return null; }
    finally { try { fs.unlinkSync(tmpFile); } catch { /* ignore */ } }
  }, [setRawMode]);

  /** Open hooks.rpcon.mjs in nvim, then syntax-check and hot-reload it */
  const editHooks = useCallback(async () => {
    const hookPath = join(process.cwd(), "hooks.rpcon.mjs");
    setRawMode(false);
    spawnSync("nvim", [hookPath], { stdio: "inherit" });
    setRawMode(true);

    // syntax check without executing
    const check = spawnSync("node", ["--check", hookPath], { encoding: "utf-8" });
    if (check.status !== 0) {
      const msg = (check.stderr as string).split("\n")[0] ?? "syntax error";
      setState(s => ({ ...s, error: `hooks: ${msg}` }));
      return;
    }

    // reload with cache-busting query param so ESM doesn't serve the stale module
    try {
      const mod = await import(pathToFileURL(hookPath).href + "?t=" + Date.now()) as THooks;
      setActiveHooks({
        baseUrl: mod.baseUrl,
        apiName: mod.apiName,
        beforeRequest: mod.beforeRequest,
        afterResponse: mod.afterResponse,
      });
      setState(s => ({ ...s, error: null }));
    } catch (e) {
      setState(s => ({ ...s, error: `hooks reload: ${String(e)}` }));
    }
  }, [setRawMode]);

  /** Validate params, convert YAML→JSON, and send the JSON-RPC request */
  const sendRequest = useCallback(async () => {
    if (state.method.trim() === "") {
      setState(s => ({ ...s, error: "Method is required" }));
      setShowMethod(true);
      return;
    }
    let parsedParams;
    try {
      parsedParams = yamlToParams(state.params);
    } catch {
      setState(s => ({ ...s, error: "Invalid YAML in params" }));
      return;
    }
    setState(s => ({ ...s, loading: true, error: null }));
    setParamsActive(false);
    const entry = await client.call(url, state.method, parsedParams);
    setState(s => ({
      ...s,
      loading: false,
      history: [entry, ...s.history],
      activeEntry: entry,
    }));
    setHistoryIndex(0);
  }, [state.method, state.params, url]);

  /** Save method/params to the currently loaded file (overwrite) */
  const saveCurrentFile = useCallback(() => {
    if (state.loadedFile === null) {
      setState(s => ({ ...s, error: "no file name — use :write <filename>" }));
      return;
    }
    const updated: RequestFile = {
      ...state.loadedFile,
      method: state.method,
      params: state.params,
    };
    try {
      saveRequestFile(updated);
      setState(s => ({ ...s, loadedFile: updated, error: null }));
    } catch (e) {
      setState(s => ({ ...s, error: `write: ${String(e)}` }));
    }
  }, [state.loadedFile, state.method, state.params]);

  /**
   * Execute a command from the vim-style command line.
   * The full string (including optional argument) is passed and parsed here.
   */
  const executeCommand = useCallback((fullCmd: string) => {
    const parts = fullCmd.trim().split(/\s+/);
    const raw  = parts[0] ?? "";
    const arg  = parts.slice(1).join(" ");
    const name = resolveCommand(raw);
    if (name === null) {
      setState(s => ({ ...s, error: `Unknown command: ${raw}` }));
      return;
    }
    switch (name) {
      case "send":     void sendRequest(); break;
      case "quit":     setConfirmQuit(true); break;
      case "history":  setState(s => ({ ...s, showHistory: !s.showHistory, error: null })); break;
      case "method":
        if (arg !== "") {
          setState(s => ({ ...s, method: arg, error: null }));
        } else {
          setShowMethod(true); setMethodQuery(""); setMethodField("input"); setMethodListIndex(0);
        }
        break;
      case "params":   setParamsActive(true); setParamsCursor(state.params.length); setState(s => ({ ...s, error: null })); break;
      case "nvim": {
        const edited = spawnNvim(state.params, "yaml", false);
        if (edited !== null) { setState(s => ({ ...s, params: edited, error: null })); setParamsCursor(edited.length); }
        break;
      }
      case "view": {
        if (state.activeEntry === null) { setState(s => ({ ...s, error: "No response yet" })); break; }
        const e = state.activeEntry;
        spawnNvim(e.error !== null ? e.error : valueToYaml(e.response?.result), "yaml", true);
        break;
      }
      case "viewraw": {
        if (state.activeEntry === null) { setState(s => ({ ...s, error: "No response yet" })); break; }
        spawnNvim(JSON.stringify(state.activeEntry.response ?? state.activeEntry.error, null, 2), "json", true);
        break;
      }
      case "requests": setRequestFiles(scanRequestFiles(process.cwd())); setPickerIndex(0); setShowRequestPicker(true); break;
      case "hooks":    void editHooks(); break;
      case "write": {
        if (arg !== "") {
          // :write filename — save as new file
          try {
            const rf = saveRequestFileAs(arg, state.method, state.params, process.cwd());
            setRequestFiles(scanRequestFiles(process.cwd()));
            setState(s => ({ ...s, loadedFile: rf, error: null }));
          } catch (e) {
            setState(s => ({ ...s, error: `write: ${String(e)}` }));
          }
        } else {
          // :write — save to current file
          saveCurrentFile();
        }
        break;
      }
      case "load": {
        if (arg === "") { setState(s => ({ ...s, error: "load: filename required" })); break; }
        const files = scanRequestFiles(process.cwd());
        const found = files.find(f => f.name === arg || f.filePath.endsWith(arg));
        if (found === undefined) { setState(s => ({ ...s, error: `load: not found: ${arg}` })); break; }
        setState(s => ({ ...s, method: found.method, params: found.params, loadedFile: found, error: null }));
        setParamsCursor(0);
        break;
      }
      case "new":
        setState(s => ({ ...s, method: "", params: "", loadedFile: null, error: null }));
        setParamsCursor(0);
        break;
      default: break; // resolveCommand already guards against unknown names
    }
  }, [sendRequest, spawnNvim, state, editHooks, saveCurrentFile]);

  useInput((input, key) => {
    // Always global
    if (key.ctrl && input === "c") { exit(); return; }

    // ── Command line mode ──────────────────────────────────────────
    if (commandMode) {
      if (key.escape) {
        setCommandMode(false);
        setCommandInput("");
        return;
      }
      if (key.upArrow) {
        setCommandSuggestionIndex(i => Math.max(0, i - 1));
        return;
      }
      if (key.downArrow) {
        setCommandSuggestionIndex(i => Math.min(completions.length - 1, i + 1));
        return;
      }
      if (key.tab) {
        const item = completions[commandSuggestionIndex];
        if (item !== undefined) {
          const hasArg = commandInput.includes(" ");
          if (hasArg) {
            const cmdPart = commandInput.split(/\s+/)[0] ?? "";
            setCommandInput(`${cmdPart} ${item.primary}`);
          } else {
            setCommandInput(item.primary);
          }
        }
        return;
      }
      if (key.return) {
        const typed = commandInput.trim();
        const hasArg = typed.includes(" ");
        let cmd: string;
        if (hasArg) {
          const cmdPart = typed.split(/\s+/)[0] ?? "";
          const item = completions[commandSuggestionIndex];
          cmd = item !== undefined ? `${cmdPart} ${item.primary}` : typed;
        } else {
          const item = completions[commandSuggestionIndex];
          cmd = (item !== undefined && item.primary !== "") ? item.primary : typed;
        }
        setCommandMode(false);
        setCommandInput("");
        if (cmd !== "") executeCommand(cmd);
        return;
      }
      if (key.backspace || key.delete) {
        setCommandInput(s => s.slice(0, -1));
        setCommandSuggestionIndex(0);
        return;
      }
      if (input.length === 1 && !key.ctrl && !key.meta) {
        setCommandInput(s => s + input);
        setCommandSuggestionIndex(0);
        return;
      }
      return;
    }

    // ── Quit confirmation ──────────────────────────────────────────
    if (confirmQuit) {
      if (input === "y") { exit(); return; }
      setConfirmQuit(false);
      return;
    }

    // ── History popup ──────────────────────────────────────────────
    if (state.showHistory) {
      if (key.upArrow || input === "k") {
        setHistoryIndex(i => Math.max(0, i - 1));
      } else if (key.downArrow || input === "j") {
        setHistoryIndex(i => Math.min(state.history.length - 1, i + 1));
      } else if (key.return) {
        const entry = state.history[historyIndex];
        if (entry !== undefined) {
          setState(s => ({
            ...s,
            method: entry.request.method,
            params: entry.request.params !== undefined ? valueToYaml(entry.request.params) : "",
            activeEntry: entry,
            showHistory: false,
            error: null,
          }));
          setParamsCursor(0);
        }
      } else if (input === "d" || input === "D") {
        setState(s => {
          const next = s.history.filter((_, i) => i !== historyIndex);
          return { ...s, history: next, activeEntry: next[0] ?? null };
        });
        setHistoryIndex(i => Math.max(0, i - 1));
      } else if (key.escape || input === "h") {
        setState(s => ({ ...s, showHistory: false }));
      }
      return;
    }

    // ── Request picker popup ───────────────────────────────────────
    if (showRequestPicker) {
      if (key.upArrow || input === "k") {
        setPickerIndex(i => Math.max(0, i - 1));
      } else if (key.downArrow || input === "j") {
        setPickerIndex(i => Math.min(requestFiles.length - 1, i + 1));
      } else if (key.return) {
        const file = requestFiles[pickerIndex];
        if (file !== undefined) {
          setState(s => ({
            ...s,
            method: file.method,
            params: file.params,
            loadedFile: file,
            error: null,
          }));
          setParamsCursor(0);
        }
        setShowRequestPicker(false);
      } else if (key.escape) {
        setShowRequestPicker(false);
      }
      return;
    }

    // ── Method popup ───────────────────────────────────────────────
    if (showMethod) {
      if (key.escape) {
        setShowMethod(false);
        setMethodQuery("");
        setMethodField("input");
        return;
      }
      if (key.tab) {
        setMethodField(f => f === "input" ? "list" : "input");
        return;
      }
      if (key.return) {
        if (methodField === "list") {
          const selected = filteredMethods[methodListIndex];
          if (selected !== undefined) {
            setState(s => ({ ...s, method: selected, error: null }));
          }
        } else if (methodQuery.trim() !== "") {
          setState(s => ({ ...s, method: methodQuery.trim(), error: null }));
        }
        setShowMethod(false);
        setMethodQuery("");
        setMethodField("input");
        return;
      }
      if (methodField === "list") {
        if (key.upArrow || input === "k") {
          if (methodListIndex === 0) {
            setMethodField("input");
          } else {
            setMethodListIndex(i => i - 1);
          }
        } else if (key.downArrow || input === "j") {
          setMethodListIndex(i => Math.min(filteredMethods.length - 1, i + 1));
        }
      } else {
        // input field
        if (key.upArrow) {
          // stay
        } else if (key.downArrow && filteredMethods.length > 0) {
          setMethodField("list");
          setMethodListIndex(0);
        } else if (key.backspace || key.delete) {
          setMethodQuery(q => q.slice(0, -1));
        } else if (input.length === 1 && !key.ctrl && !key.meta) {
          setMethodQuery(q => q + input);
        }
      }
      return;
    }

    // ── Params editor (active) ─────────────────────────────────────
    if (paramsActive) {
      if (key.escape) { setParamsActive(false); return; }
      if (key.tab) {
        const [t, p] = insertAt(state.params, paramsCursor, "  ");
        setState(s => ({ ...s, params: t }));
        setParamsCursor(p);
        return;
      }
      if (key.upArrow) { setParamsCursor(c => cursorUp(state.params, c)); return; }
      if (key.downArrow) { setParamsCursor(c => cursorDown(state.params, c)); return; }
      if (key.leftArrow) { setParamsCursor(c => cursorLeft(c)); return; }
      if (key.rightArrow) { setParamsCursor(c => cursorRight(state.params, c)); return; }
      if (key.backspace || key.delete) {
        const [t, p] = deleteBackward(state.params, paramsCursor);
        setState(s => ({ ...s, params: t }));
        setParamsCursor(p);
        return;
      }
      if (key.return) {
        const [t, p] = insertAt(state.params, paramsCursor, "\n");
        setState(s => ({ ...s, params: t }));
        setParamsCursor(p);
        return;
      }
      if (input.length === 1 && !key.ctrl && !key.meta) {
        const [t, p] = insertAt(state.params, paramsCursor, input);
        setState(s => ({ ...s, params: t }));
        setParamsCursor(p);
        return;
      }
      // Ctrl+D — delete forward
      if (key.ctrl && input === "d") {
        setState(s => ({ ...s, params: deleteForward(s.params, paramsCursor) }));
        return;
      }
      return;
    }

    // ── Command mode ───────────────────────────────────────────────
    if (input === ":") { setCommandMode(true); setCommandInput(""); setCommandSuggestionIndex(0); return; }
    if (key.return) { void sendRequest(); return; }
    if (input === "q") { setConfirmQuit(true); return; }
    if (input === "C") { void editHooks(); return; }
    if (input === "?") { setShowHelp(h => !h); return; }
    if (input === "h") {
      setState(s => ({ ...s, showHistory: !s.showHistory, error: null }));
      return;
    }
    if (input === "m") {
      setShowMethod(true);
      setMethodQuery("");
      setMethodField("input");
      setMethodListIndex(0);
      return;
    }
    if (input === "p") {
      setParamsActive(true);
      setParamsCursor(state.params.length); // cursor at end
      setState(s => ({ ...s, error: null }));
      return;
    }
    if (input === "P") {
      const edited = spawnNvim(state.params, "yaml", false);
      if (edited !== null) {
        setState(s => ({ ...s, params: edited, error: null }));
        setParamsCursor(edited.length);
      }
      return;
    }
    if (input === "r") {
      if (state.activeEntry === null) { setState(s => ({ ...s, error: "No response yet" })); return; }
      const { activeEntry: e } = state;
      spawnNvim(e.error !== null ? e.error : valueToYaml(e.response?.result), "yaml", true);
      return;
    }
    if (input === "R") {
      if (state.activeEntry === null) { setState(s => ({ ...s, error: "No response yet" })); return; }
      spawnNvim(JSON.stringify(state.activeEntry.response ?? state.activeEntry.error, null, 2), "json", true);
      return;
    }
    // Space — open request picker
    if (input === " ") {
      setRequestFiles(scanRequestFiles(process.cwd()));
      setPickerIndex(0);
      setShowRequestPicker(true);
      return;
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <Box flexDirection="column" height={stdout.rows}>
        {/* Top info bar — no border, themed background */}
        <Box paddingX={1} gap={2} backgroundColor={theme.infoBar.backgroundColor}>
          <Text {...theme.infoBar.logo}>rpcon</Text>
          <Text {...theme.infoBar.url}>{resolveHookString(activeHooks.apiName) ?? url}</Text>
          {state.method !== "" && <Text {...theme.infoBar.method}>{state.method}</Text>}
          {state.loading && <Text {...theme.infoBar.loading}>sending…</Text>}
        </Box>

        {/* Params and Response side by side — fill remaining height */}
        <Box flexDirection="row" flexGrow={1}>
          <RequestPanel
            params={state.params}
            cursorPos={paramsCursor}
            active={paramsActive}
          />
          <Box
            borderStyle={theme.panelDivider.style as "single"}
            borderLeft={true}
            borderRight={false}
            borderTop={false}
            borderBottom={false}
            borderColor={theme.panelDivider.color}
          />
          <ResponsePanel entry={state.activeEntry} />
        </Box>

        {/* Status bar — no border */}
        <StatusBar
          paramsActive={paramsActive}
          loading={state.loading}
          error={state.error}
          showHistory={state.showHistory}
          confirmQuit={confirmQuit}
          commandMode={commandMode}
          commandInput={commandInput}
          loadedFile={state.loadedFile}
          isDirty={isDirty}
        />

        {/* Overlays — rendered last so they paint on top */}
        {state.showHistory && (
          <HistoryPopup
            entries={state.history}
            activeId={state.activeEntry?.id ?? null}
            selectedIndex={historyIndex}
          />
        )}
        {showMethod && (
          <MethodPopup
            query={methodQuery}
            methods={allMethods}
            selectedIndex={methodListIndex}
            fieldFocus={methodField}
          />
        )}
        {showRequestPicker && (
          <RequestPickerPopup
            files={requestFiles}
            selectedIndex={pickerIndex}
          />
        )}
        {commandMode && (
          <CommandCompletionPopup
            items={completions}
            selectedIndex={commandSuggestionIndex}
            rows={stdout.rows}
          />
        )}
        {showHelp && (
          <HelpPopup rows={stdout.rows} cols={stdout.columns} />
        )}
      </Box>
    </ThemeProvider>
  );
}
