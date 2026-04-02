// Keyboard shortcut help overlay — anchored to bottom-right

import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../ThemeContext.js";

interface HelpPopupProps {
  /** Total terminal rows — used to anchor popup above the status bar */
  rows: number;
  /** Total terminal columns — used to anchor popup to the right edge */
  cols: number;
}

/** Two-column shortcut table rendered as a background box, no border */
const ROWS: [string, string, string, string][] = [
  ["Enter", "send",             "m",     "method"],
  ["p",     "params (inline)",  "P",     "params (nvim)"],
  ["r",     "response YAML",    "R",     "response raw"],
  ["h",     "history",          "Space", "requests"],
  ["C",     "hooks",            "q",     "quit"],
  ["?",     "this help",        ":",     "command"],
];

const KEY_W  = 5;
const DESC_W = 16;
const POPUP_W = (KEY_W + 2 + DESC_W + 3) * 2 + 2; // two columns + padding

/** Absolute-positioned help overlay anchored to bottom-right, above the status bar */
export function HelpPopup({ rows, cols }: HelpPopupProps): React.ReactElement {
  const t = useTheme();
  const b = t.commandLine.completionBorder;

  const marginTop  = Math.max(0, rows - ROWS.length - 1);
  const marginLeft = Math.max(0, cols - POPUP_W);

  return (
    <Box
      position="absolute"
      marginTop={marginTop}
      marginLeft={marginLeft}
      flexDirection="column"
      width={POPUP_W}
      backgroundColor={b.backgroundColor}
    >
      {ROWS.map(([k1, d1, k2, d2]) => (
        <Box key={k1} paddingX={1} gap={0}>
          <Text color="white">{k1.padEnd(KEY_W)}</Text>
          <Text {...t.commandLine.unselectedDescription}>{"  "}{d1.padEnd(DESC_W)}</Text>
          <Text color="white">{"   "}{k2.padEnd(KEY_W)}</Text>
          <Text {...t.commandLine.unselectedDescription}>{"  "}{d2}</Text>
        </Box>
      ))}
    </Box>
  );
}
