// Response panel displaying JSON-RPC results as YAML

import React from "react";
import { Box, Text } from "ink";
import type { HistoryEntry } from "../types.mjs";
import { valueToYaml } from "../utils/yaml.mjs";
import { useTheme } from "../ThemeContext.js";

interface ResponsePanelProps {
  entry: HistoryEntry | null;
}

/** Renders the JSON-RPC response — success result as YAML, errors in red */
export function ResponsePanel({ entry }: ResponsePanelProps): React.ReactElement {
  const t = useTheme();

  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      flexBasis={0}
      paddingX={1}
      overflow="hidden"
    >
      <Box justifyContent="space-between">
        <Text {...t.responsePanel.title}> Response</Text>
        {entry?.durationMs !== undefined && entry.durationMs !== null && (
          <Text {...t.responsePanel.duration}>{entry.durationMs}ms </Text>
        )}
      </Box>

      {entry === null && (
        <Text {...t.responsePanel.empty}>No response yet</Text>
      )}

      {entry !== null && (
        <Box flexDirection="column" marginTop={1}>
          {entry.error !== null ? (
            <Text {...t.responsePanel.transportError}>{entry.error}</Text>
          ) : entry.response?.error !== undefined ? (
            <>
              <Text {...t.responsePanel.rpcError}>
                Error {entry.response.error.code}: {entry.response.error.message}
              </Text>
              {entry.response.error.data !== undefined && (
                <Text {...t.responsePanel.rpcErrorData}>{valueToYaml(entry.response.error.data)}</Text>
              )}
            </>
          ) : (
            <Text {...t.responsePanel.successResult}>{valueToYaml(entry.response?.result)}</Text>
          )}
        </Box>
      )}
    </Box>
  );
}
