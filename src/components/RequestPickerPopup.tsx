// Request file picker popup — two-column layout: list on the left, preview on the right

import React from "react";
import { Box, Text } from "ink";
import type { RequestFile } from "../types.mjs";
import { useTheme } from "../ThemeContext.js";

interface RequestPickerPopupProps {
  /** All discovered *.rpcoon.yaml files */
  files: RequestFile[];
  /** Index of the currently highlighted entry */
  selectedIndex: number;
}

const LIST_WIDTH = 28;
const POPUP_WIDTH = 80;
const MAX_VISIBLE = 16;

/** Absolute-positioned two-column overlay for selecting a saved request */
export function RequestPickerPopup({
  files,
  selectedIndex,
}: RequestPickerPopupProps): React.ReactElement {
  const t = useTheme();
  const b = t.requestPickerPopup.border;
  const d = t.requestPickerPopup.divider;

  const selected = files[selectedIndex];

  const visible = files.slice(0, MAX_VISIBLE);

  return (
    <Box
      position="absolute"
      marginTop={2}
      marginLeft={2}
      width={POPUP_WIDTH}
      flexDirection="column"
      borderStyle={b.style as "single"}
      borderColor={b.color}
      backgroundColor={b.backgroundColor}
    >
      {/* Header row */}
      <Text {...t.requestPickerPopup.header}>
        {" "}Requests   ↑↓/jk navigate   Enter load   Esc close
      </Text>

      {/* Body: list + divider + preview */}
      <Box flexDirection="row" flexGrow={1}>
        {/* Left: file list */}
        <Box flexDirection="column" width={LIST_WIDTH}>
          {files.length === 0 ? (
            <Box paddingX={1}>
              <Text {...t.requestPickerPopup.empty}>No *.rpcoon.yaml files found</Text>
            </Box>
          ) : (
            visible.map((f, idx) => {
              const isSelected = idx === selectedIndex;
              const style = isSelected
                ? t.requestPickerPopup.selectedItem
                : t.requestPickerPopup.unselectedItem;
              const prefix = isSelected ? "❯ " : "  ";
              // Truncate name to fit the column
              const maxLen = LIST_WIDTH - 4;
              const label = f.name.length > maxLen
                ? f.name.slice(0, maxLen - 1) + "…"
                : f.name;
              return (
                <Box key={f.filePath} paddingX={1}>
                  <Text {...style}>{prefix}{label}</Text>
                </Box>
              );
            })
          )}
        </Box>

        {/* Vertical divider */}
        <Box
          borderStyle={d.style as "single"}
          borderLeft={true}
          borderRight={false}
          borderTop={false}
          borderBottom={false}
          borderColor={d.color}
        />

        {/* Right: preview */}
        <Box flexDirection="column" flexGrow={1} paddingX={1}>
          {selected !== undefined ? (
            <>
              <Box gap={1}>
                <Text {...t.requestPickerPopup.previewLabel}>Method:</Text>
                <Text {...t.requestPickerPopup.previewMethod}>
                  {selected.method !== "" ? selected.method : "(none)"}
                </Text>
              </Box>
              {selected.params.trim() !== "" && (
                <>
                  <Text {...t.requestPickerPopup.previewLabel}>Params:</Text>
                  <Text {...t.requestPickerPopup.previewParams}>
                    {selected.params}
                  </Text>
                </>
              )}
            </>
          ) : (
            <Text {...t.requestPickerPopup.empty}>—</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}
