// Vim-style command-line completion popup — floats above the status bar

import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../ThemeContext.js";
import type { CompletionItem } from "../types.mjs";

interface CommandCompletionPopupProps {
  /** Completions to display — commands or argument values */
  items: CompletionItem[];
  /** Index of the currently highlighted item */
  selectedIndex: number;
  /** Total terminal rows — used to anchor the popup to the bottom */
  rows: number;
}

const MAX_VISIBLE = 10;

/** Absolute-positioned overlay showing command or argument completions just above the status bar */
export function CommandCompletionPopup({
  items,
  selectedIndex,
  rows,
}: CommandCompletionPopupProps): React.ReactElement | null {
  const t = useTheme();
  const b = t.commandLine.completionBorder;

  const visible = items.slice(0, MAX_VISIBLE);
  if (visible.length === 0) return null;

  // popup height = visible items (no border)
  // the status bar occupies the last row, so we push up by popupHeight + 1
  const popupHeight = visible.length;
  const marginTop = Math.max(0, rows - popupHeight - 1);

  return (
    <Box
      position="absolute"
      marginTop={marginTop}
      marginLeft={0}
      flexDirection="column"
      width={72}
      backgroundColor={b.backgroundColor}
    >
      {visible.map((item, idx) => {
        const isSelected = idx === selectedIndex;
        const nameStyle = isSelected
          ? t.commandLine.selectedName
          : t.commandLine.unselectedName;
        const descStyle = isSelected
          ? t.commandLine.selectedDescription
          : t.commandLine.unselectedDescription;
        return (
          <Box key={item.primary} paddingX={1} gap={2}>
            <Text {...nameStyle}>{isSelected ? "❯ " : "  "}{item.primary}</Text>
            {item.secondary !== undefined && item.secondary !== "" && (
              <Text {...descStyle}>{item.secondary}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
