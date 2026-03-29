// Main application component

import React, { useState, useCallback, useMemo } from "react";
import { Box, Text, useInput, useApp, useStdin, useStdout } from "ink";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import { HistoryPopup } from "./components/HistoryPopup.js";
import { MethodPopup } from "./components/MethodPopup.js";
import { RequestPanel } from "./components/RequestPanel.js";
import { ResponsePanel } from "./components/ResponsePanel.js";
import { StatusBar } from "./components/StatusBar.js";
import { RpcClient } from "./rpc/client.mjs";
import { HttpTransport } from "./transport/http.mjs";
import { yamlToParams, valueToYaml } from "./utils/yaml.mjs";
import {
  cursorLeft, cursorRight, cursorUp, cursorDown,
  insertAt, deleteBackward, deleteForward,
} from "./utils/cursor.mjs";
import type { AppState, Theme } from "./types.mjs";
import { ThemeProvider } from "./ThemeContext.js";
import { ayuMirageTheme } from "./theme.mjs";

const transport = new HttpTransport();
const client = new RpcClient(transport);

interface AppProps {
  /** JSON-RPC endpoint URL from CLI argv */
  url: string;
  /** Visual theme; defaults to defaultTheme when omitted */
  theme?: Theme;
}

/** Root application component managing global state and keyboard navigation */
export function App({ url, theme = ayuMirageTheme }: AppProps): React.ReactElement {
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

  useInput((input, key) => {
    // Always global
    if (key.ctrl && input === "c") { exit(); return; }

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
    if (key.return) { void sendRequest(); return; }
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
  });

  return (
    <ThemeProvider theme={theme}>
      <Box flexDirection="column" height={stdout.rows}>
        {/* Top info bar — no border */}
        <Box paddingX={1} gap={2}>
          <Text {...theme.infoBar.logo}>rpcon</Text>
          <Text {...theme.infoBar.url}>{url}</Text>
          {state.method !== "" && <Text {...theme.infoBar.method}>{state.method}</Text>}
          {state.loading && <Text {...theme.infoBar.loading}>sending…</Text>}
        </Box>

        {/* Separator */}
        <Box
          borderStyle={theme.separator.style as "single"}
          borderTop={false}
          borderLeft={false}
          borderRight={false}
          borderColor={theme.separator.color}
        />

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
      </Box>
    </ThemeProvider>
  );
}
