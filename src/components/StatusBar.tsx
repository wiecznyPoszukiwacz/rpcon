// Bottom status bar — no border

import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../ThemeContext.js";
import type { RequestFile } from "../types.mjs";

interface StatusBarProps {
  paramsActive: boolean;
  loading: boolean;
  error: string | null;
  showHistory: boolean;
  confirmQuit: boolean;
  /** Whether the vim-style command line is active */
  commandMode: boolean;
  /** Current text typed in the command line */
  commandInput: string;
  /** Currently loaded request file, if any */
  loadedFile: RequestFile | null;
  /** Whether method/params differ from the loaded file */
  isDirty: boolean;
}

/** Displays current state and file info; shows `?` / `:` hints on the right */
export function StatusBar({
  paramsActive,
  loading,
  error,
  showHistory,
  confirmQuit,
  commandMode,
  commandInput,
  loadedFile,
  isDirty,
}: StatusBarProps): React.ReactElement {
  const t = useTheme();

  if (commandMode) {
    return (
      <Box>
        <Text {...t.commandLine.prompt}>:</Text>
        <Text {...t.commandLine.inputText}>{commandInput}</Text>
        <Text {...t.commandLine.cursor}>█</Text>
      </Box>
    );
  }
  if (confirmQuit) {
    return <Text {...t.statusBar.error}>  Quit? y / any key to cancel</Text>;
  }
  if (showHistory) {
    return <Text {...t.statusBar.historyMode}>  ↑↓/jk navigate   Enter load   D delete   Esc/h close</Text>;
  }
  if (loading) {
    return <Text {...t.statusBar.loading}> Sending…</Text>;
  }
  if (error !== null) {
    return <Text {...t.statusBar.error}> {error}</Text>;
  }
  if (paramsActive) {
    return <Text {...t.statusBar.paramsActive}>  Esc command mode   Tab indent (2sp)</Text>;
  }

  // File label shown on the left
  const fileLabel = loadedFile !== null
    ? `${isDirty ? "● " : ""}${loadedFile.name}`
    : "[No File]";

  return (
    <Box>
      <Text {...(isDirty ? t.requestPickerPopup.dirtyIndicator : t.statusBar.default)}> {fileLabel}</Text>
      <Box flexGrow={1} />
      <Text {...t.statusBar.default}> </Text>
      <Text color="white">?</Text>
      <Text {...t.statusBar.default}>  help   </Text>
      <Text color="white">:</Text>
      <Text {...t.statusBar.default}>  command </Text>
    </Box>
  );
}
