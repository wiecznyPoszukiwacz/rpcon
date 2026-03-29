// Bottom status bar — no border

import React from "react";
import { Text } from "ink";
import { useTheme } from "../ThemeContext.js";

interface StatusBarProps {
  paramsActive: boolean;
  loading: boolean;
  error: string | null;
  showHistory: boolean;
}

/** Displays keyboard hints and current application state */
export function StatusBar({ paramsActive, loading, error, showHistory }: StatusBarProps): React.ReactElement {
  const t = useTheme();

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
  return <Text {...t.statusBar.default}>  Enter send   m method   p params   P nvim   r yaml   R raw   h history</Text>;
}
