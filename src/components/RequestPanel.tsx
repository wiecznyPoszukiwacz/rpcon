// Params panel with inline YAML editor

import React from "react";
import { Box, Text } from "ink";
import { ParamsEditor } from "./ParamsEditor.js";

interface RequestPanelProps {
  params: string;
  cursorPos: number;
  active: boolean;
}

/** Renders the params YAML panel with an inline editor when active */
export function RequestPanel({ params, cursorPos, active }: RequestPanelProps): React.ReactElement {
  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      flexBasis={0}
      overflow="hidden"
    >
      <Box paddingX={1} justifyContent="space-between">
        <Text color={active ? "cyan" : "white"}> Params (YAML)</Text>
        {active && <Text dimColor>Esc exit   Tab indent </Text>}
      </Box>
      <ParamsEditor value={params} cursorPos={cursorPos} active={active} />
    </Box>
  );
}
