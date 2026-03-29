// History overlay popup component

import React from "react";
import { Box, Text } from "ink";
import type { HistoryEntry } from "../types.mjs";
import { useTheme } from "../ThemeContext.js";

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
  const t = useTheme();
  const b = t.historyPopup.border;

  return (
    <Box
      position="absolute"
      marginTop={2}
      marginLeft={4}
      width={64}
      flexDirection="column"
      borderStyle={b.style as "single"}
      borderColor={b.color}
      backgroundColor={b.backgroundColor}
    >
      <Text {...t.historyPopup.header}> History   ↑↓/jk navigate   Enter load   D delete   Esc/h close</Text>
      {entries.length === 0 && (
        <Box paddingX={1}>
          <Text {...t.historyPopup.empty}>No requests yet</Text>
        </Box>
      )}
      {entries.map((entry, idx) => {
        const isSelected = idx === selectedIndex;
        const isActive = entry.id === activeId;
        const hasError = entry.error !== null || entry.response?.error !== undefined;
        const dur = entry.durationMs !== null ? ` ${entry.durationMs}ms` : "";

        const methodStyle = isSelected
          ? t.historyPopup.selectedMethod
          : isActive
            ? t.historyPopup.activeMethod
            : t.historyPopup.inactiveMethod;

        return (
          <Box key={entry.id} paddingX={1} gap={1}>
            <Text {...(hasError ? t.historyPopup.errorIcon : t.historyPopup.successIcon)}>
              {hasError ? "✗" : "✓"}
            </Text>
            <Text {...methodStyle}>{entry.request.method}</Text>
            <Text {...t.historyPopup.meta}>{entry.url.replace(/^https?:\/\//, "")}{dur}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
