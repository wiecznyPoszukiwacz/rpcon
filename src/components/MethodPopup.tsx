// Method selection popup — text search field + filtered list

import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../ThemeContext.js";

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
  const t = useTheme();
  const b = t.methodPopup.border;

  const filtered = methods.filter(m =>
    m.toLowerCase().includes(query.toLowerCase()),
  );

  const inputBorder = fieldFocus === "input"
    ? t.methodPopup.inputBorderFocused
    : t.methodPopup.inputBorderUnfocused;

  return (
    <Box
      position="absolute"
      marginTop={1}
      marginLeft={1}
      width={56}
      flexDirection="column"
      borderStyle={b.style as "single"}
      borderColor={b.color}
      backgroundColor={b.backgroundColor}
    >
      <Text {...t.methodPopup.header}> Method   Tab switch   Enter confirm   Esc close</Text>

      {/* Input field */}
      <Box
        borderStyle={inputBorder.style as "single"}
        borderColor={inputBorder.color}
        marginX={1}
        paddingX={1}
      >
        <Text>{query}</Text>
        {fieldFocus === "input" && <Text {...t.methodPopup.cursor}>█</Text>}
      </Box>

      {/* Filtered list */}
      <Box flexDirection="column" marginTop={1}>
        {filtered.length === 0 ? (
          <Box paddingX={2}>
            <Text {...t.methodPopup.empty}>no methods in history</Text>
          </Box>
        ) : (
          filtered.slice(0, MAX_VISIBLE).map((m, idx) => {
            const isSelected = fieldFocus === "list" && idx === selectedIndex;
            const itemStyle = isSelected
              ? t.methodPopup.selectedItem
              : t.methodPopup.unselectedItem;
            return (
              <Box key={m} paddingX={2}>
                <Text {...itemStyle}>
                  {isSelected ? "❯ " : "  "}{m}
                </Text>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
