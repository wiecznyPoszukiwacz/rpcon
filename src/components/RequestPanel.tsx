// Params panel with inline YAML editor

import React from "react";
import { Box, Text } from "ink";
import { ParamsEditor } from "./ParamsEditor.js";
import { useTheme } from "../ThemeContext.js";

interface RequestPanelProps {
  params: string;
  cursorPos: number;
  active: boolean;
}

/** Renders the params YAML panel with an inline editor when active */
export function RequestPanel({ params, cursorPos, active }: RequestPanelProps): React.ReactElement {
  const t = useTheme();
  const titleStyle = active ? t.requestPanel.titleActive : t.requestPanel.titleInactive;

  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      flexBasis={0}
      overflow="hidden"
    >
      <Box paddingX={1} justifyContent="space-between">
        <Text {...titleStyle}> Params (YAML)</Text>
        {active && <Text {...t.requestPanel.hint}>Esc exit   Tab indent </Text>}
      </Box>
      <ParamsEditor value={params} cursorPos={cursorPos} active={active} />
    </Box>
  );
}
