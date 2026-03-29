// YAML ↔ JSON conversion utilities

import { parse, stringify } from "yaml";
import type { JsonRpcParams } from "../types.mjs";

/**
 * Parse a YAML string into JsonRpcParams.
 * Returns undefined for empty input.
 * Throws TypeError if the result is not an object or array.
 */
export function yamlToParams(raw: string): JsonRpcParams | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;

  const parsed: unknown = parse(trimmed);
  if (parsed === null || parsed === undefined) return undefined;

  if (typeof parsed !== "object" && !Array.isArray(parsed)) {
    throw new TypeError("Params must be an object or array");
  }

  return parsed as JsonRpcParams;
}

/**
 * Convert any JSON-serialisable value to a YAML string for display.
 * Falls back to JSON.stringify if YAML serialisation fails.
 */
export function valueToYaml(value: unknown): string {
  try {
    return stringify(value, { indent: 2 }).trimEnd();
  } catch {
    return JSON.stringify(value, null, 2);
  }
}
