// Response panel displaying JSON-RPC results as YAML

import React from "react";
import { Box, Text } from "ink";
import type { HistoryEntry } from "../types.mjs";
import { valueToYaml } from "../utils/yaml.mjs";

interface ResponsePanelProps {
  entry: HistoryEntry | null;
}

/** Renders the JSON-RPC response — success result as YAML, errors in red */
export function ResponsePanel({ entry }: ResponsePanelProps): React.ReactElement {
  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      flexBasis={0}
      paddingX={1}
      overflow="hidden"
    >
      <Box justifyContent="space-between">
        <Text color="cyan"> Response</Text>
        {entry?.durationMs !== undefined && entry.durationMs !== null && (
          <Text color="yellow">{entry.durationMs}ms </Text>
        )}
      </Box>

      {entry === null && (
        <Text dimColor>No response yet</Text>
      )}

      {entry !== null && (
        <Box flexDirection="column" marginTop={1}>
          {entry.error !== null ? (
            <Text color="red">{entry.error}</Text>
          ) : entry.response?.error !== undefined ? (
            <>
              <Text color="red">Error {entry.response.error.code}: {entry.response.error.message}</Text>
              {entry.response.error.data !== undefined && (
                <Text dimColor>{valueToYaml(entry.response.error.data)}</Text>
              )}
            </>
          ) : (
            <Text color="green">{valueToYaml(entry.response?.result)}</Text>
          )}
        </Box>
      )}
    </Box>
  );
}
