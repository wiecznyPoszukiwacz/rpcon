// Bottom status bar — no border

import React from "react";
import { Text } from "ink";

interface StatusBarProps {
  paramsActive: boolean;
  loading: boolean;
  error: string | null;
  showHistory: boolean;
}

/** Displays keyboard hints and current application state */
export function StatusBar({ paramsActive, loading, error, showHistory }: StatusBarProps): React.ReactElement {
  if (showHistory) {
    return <Text color="cyan">  ↑↓ navigate   Enter load   D delete   Esc / Ctrl+H close</Text>;
  }
  if (loading) {
    return <Text color="yellow"> Sending…</Text>;
  }
  if (error !== null) {
    return <Text color="red"> {error}</Text>;
  }
  if (paramsActive) {
    return <Text dimColor>  Esc command mode   Tab indent (2sp)</Text>;
  }
  return <Text dimColor>  Enter send   m method   p params   P nvim   r yaml   R raw   Ctrl+H history</Text>;
}
