// Method input with autocomplete dropdown — display only, no own keyboard handling

import React from "react";
import { Box, Text } from "ink";

const MAX_SUGGESTIONS = 8;

interface AutocompleteProps {
  value: string;
  /** Whether the field is in insert mode (cursor visible, dropdown shown) */
  insertMode: boolean;
  suggestions: string[];
  /** Currently highlighted suggestion index (-1 = none) */
  selectedIndex: number;
  placeholder?: string;
}

/** Displays the method value with cursor and an optional filtered dropdown */
export function Autocomplete({
  value,
  insertMode,
  suggestions,
  selectedIndex,
  placeholder,
}: AutocompleteProps): React.ReactElement {
  const filtered = [...new Set(
    suggestions.filter(s => s.toLowerCase().startsWith(value.toLowerCase())),
  )].slice(0, MAX_SUGGESTIONS);

  const showDropdown = insertMode && filtered.length > 0 && value.length > 0;
  const displayValue = value.length === 0 && !insertMode
    ? (placeholder ?? "")
    : value;
  const isPlaceholder = value.length === 0 && !insertMode;

  return (
    <Box flexDirection="column">
      <Box paddingX={1}>
        <Text dimColor={isPlaceholder}>
          {displayValue}
        </Text>
        {insertMode && <Text color="cyan">█</Text>}
      </Box>

      {showDropdown && (
        <Box
          position="absolute"
          marginTop={3}
          flexDirection="column"
          borderStyle="single"
          borderColor="gray"
        >
          {filtered.map((s, idx) => (
            <Box key={s} paddingX={1}>
              <Text inverse={idx === selectedIndex} color={idx === selectedIndex ? "cyan" : "gray"}>
                {idx === selectedIndex ? "❯ " : "  "}{s}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
