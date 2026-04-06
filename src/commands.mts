// Command definitions for the vim-style command line

import type { CommandDef } from "./types.mjs";

/** All commands available via the `:` command line, in display order */
export const COMMANDS: readonly CommandDef[] = [
  { name: "send",     description: "Send JSON-RPC request" },
  { name: "method",   description: "Open method picker" },
  { name: "params",   description: "Edit params inline" },
  { name: "edit",     description: "Open params in $EDITOR" },
  { name: "view",     description: "View response as YAML in $EDITOR" },
  { name: "viewraw",  description: "View raw JSON response in $EDITOR" },
  { name: "requests", description: "Open request picker" },
  { name: "history",  description: "Toggle history popup" },
  { name: "write",    description: "Save  :write [filename]" },
  { name: "load",     description: "Load request file  :load <filename>" },
  { name: "new",      description: "New empty request" },
  { name: "hooks",    description: "Edit hooks.rpcoon.mjs in $EDITOR" },
  { name: "quit",     description: "Quit rpcoon" },
] as const;

/**
 * Return commands whose name starts with the first whitespace-separated token
 * of the input, so that typing `:write myfile` still matches the `write` command.
 */
export function filterCommands(input: string): CommandDef[] {
  const q = input.split(/\s+/)[0]?.toLowerCase() ?? "";
  if (q === "") return [...COMMANDS];
  return COMMANDS.filter(c => c.name.startsWith(q));
}

/**
 * Resolve a typed command name (possibly an abbreviation) to the canonical name.
 * Exact match wins; prefix match is accepted only when it is unambiguous (single hit).
 * Returns null when the name is unknown or ambiguous.
 */
export function resolveCommand(name: string): string | null {
  const lower = name.toLowerCase();
  const exact = COMMANDS.find(c => c.name === lower);
  if (exact !== undefined) return exact.name;
  const hits = COMMANDS.filter(c => c.name.startsWith(lower));
  if (hits.length === 1) return hits[0]!.name;
  return null;
}
