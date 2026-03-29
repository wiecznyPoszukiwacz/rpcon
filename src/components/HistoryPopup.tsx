// History overlay popup component

import React from "react";
import { Box, Text } from "ink";
import type { HistoryEntry } from "../types.mjs";

interface HistoryPopupProps {
  entries: HistoryEntry[];
  activeId: number | null;
  selectedIndex: number;
}

/** Popup overlay showing the list of past requests; rendered with position="absolute" */
export function HistoryPopup({
  entries,
  activeId,
  selectedIndex,
}: HistoryPopupProps): React.ReactElement {
  return (
    <Box
      position="absolute"
      marginTop={2}
      marginLeft={4}
      width={64}
      flexDirection="column"
      borderStyle="single"
      borderColor="cyan"
    >
      <Text color="cyan"> History   ↑↓ navigate   Enter load   D delete   Esc close</Text>
      {entries.length === 0 && (
        <Box paddingX={1}>
          <Text dimColor>No requests yet</Text>
        </Box>
      )}
      {entries.map((entry, idx) => {
        const isSelected = idx === selectedIndex;
        const isActive = entry.id === activeId;
        const hasError = entry.error !== null || entry.response?.error !== undefined;
        const statusColor = hasError ? "red" : "green";
        const statusIcon = hasError ? "✗" : "✓";
        const dur = entry.durationMs !== null ? ` ${entry.durationMs}ms` : "";

        return (
          <Box key={entry.id} paddingX={1} gap={1}>
            <Text color={statusColor}>{statusIcon}</Text>
            <Text inverse={isSelected} color={isActive ? "white" : "gray"}>
              {entry.request.method}
            </Text>
            <Text dimColor>{entry.url.replace(/^https?:\/\//, "")}{dur}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
