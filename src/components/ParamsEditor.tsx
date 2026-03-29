// Inline multi-line YAML editor with cursor rendering

import React from "react";
import { Box, Text } from "ink";
import { getLineCol } from "../utils/cursor.mjs";
import { useTheme } from "../ThemeContext.js";

interface ParamsEditorProps {
  value: string;
  cursorPos: number;
  active: boolean;
}

/** Renders YAML content line by line with an inline cursor when active */
export function ParamsEditor({ value, cursorPos, active }: ParamsEditorProps): React.ReactElement {
  const t = useTheme();

  if (value.trim() === "") {
    return (
      <Box flexGrow={1} paddingX={1}>
        <Text {...t.paramsEditor.empty}>{active ? "█" : "empty"}</Text>
      </Box>
    );
  }

  const lines = value.split("\n");
  const { line: cursorLine, col: cursorCol } = getLineCol(value, cursorPos);

  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden" paddingX={1}>
      {lines.map((lineText, idx) => {
        if (!active || idx !== cursorLine) {
          return <Text key={idx}>{lineText !== "" ? lineText : " "}</Text>;
        }
        // Render cursor line
        const before = lineText.slice(0, cursorCol);
        const cursorChar = lineText[cursorCol] ?? " ";
        const after = lineText.slice(cursorCol + 1);
        return (
          <Text key={idx}>
            {before}
            <Text {...t.paramsEditor.cursor}>{cursorChar}</Text>
            {after}
          </Text>
        );
      })}
    </Box>
  );
}
