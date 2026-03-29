// Method selection popup — text search field + filtered list

import React from "react";
import { Box, Text } from "ink";

interface MethodPopupProps {
  query: string;
  methods: string[];
  selectedIndex: number;
  fieldFocus: "input" | "list";
}

const MAX_VISIBLE = 12;

/** Absolute-positioned overlay for searching and selecting a method */
export function MethodPopup({
  query,
  methods,
  selectedIndex,
  fieldFocus,
}: MethodPopupProps): React.ReactElement {
  const filtered = methods.filter(m =>
    m.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Box
      position="absolute"
      marginTop={1}
      marginLeft={1}
      width={56}
      flexDirection="column"
      borderStyle="single"
      borderColor="cyan"
    >
      <Text color="cyan"> Method   Tab switch   Enter confirm   Esc close</Text>

      {/* Input field */}
      <Box
        borderStyle="single"
        borderColor={fieldFocus === "input" ? "cyan" : "gray"}
        marginX={1}
        paddingX={1}
      >
        <Text>{query}</Text>
        {fieldFocus === "input" && <Text color="cyan">█</Text>}
      </Box>

      {/* Filtered list */}
      <Box flexDirection="column" marginTop={1}>
        {filtered.length === 0 ? (
          <Box paddingX={2}>
            <Text dimColor>no methods in history</Text>
          </Box>
        ) : (
          filtered.slice(0, MAX_VISIBLE).map((m, idx) => (
            <Box key={m} paddingX={2}>
              <Text
                inverse={fieldFocus === "list" && idx === selectedIndex}
                color={fieldFocus === "list" && idx === selectedIndex ? "cyan" : "gray"}
              >
                {fieldFocus === "list" && idx === selectedIndex ? "❯ " : "  "}{m}
              </Text>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
