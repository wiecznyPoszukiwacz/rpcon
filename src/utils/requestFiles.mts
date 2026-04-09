// Utilities for loading, saving, and serialising *.rpcoon.yaml request files

import fs from "fs";
import path from "path";
import { parse, stringify } from "yaml";
import { valueToYaml } from "./yaml.mjs";
import type { RequestFile } from "../types.mjs";

/** Raw structure expected inside a *.rpcoon.yaml file */
interface RawRequestFile {
  name?: string;
  method?: string;
  params?: unknown;
  autoSend?: boolean;
}

/**
 * Derive a display name from a file path: strips the CWD prefix and
 * the `.rpcoon.yaml` suffix, leaving just the base name.
 */
function nameFromPath(filePath: string, cwd: string): string {
  const rel = path.relative(cwd, filePath);
  return rel.replace(/\.rpcoon\.yaml$/, "");
}

/**
 * Parse a single *.rpcoon.yaml file and return a RequestFile.
 * Returns null when the file cannot be read or is malformed.
 */
export function parseRequestFile(filePath: string, cwd: string): RequestFile | null {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }

  let doc: RawRequestFile;
  try {
    doc = (parse(raw) ?? {}) as RawRequestFile;
  } catch {
    return null;
  }

  const method = typeof doc.method === "string" ? doc.method : "";
  const params = doc.params !== undefined && doc.params !== null
    ? valueToYaml(doc.params)
    : "";
  const name = typeof doc.name === "string" && doc.name.trim() !== ""
    ? doc.name.trim()
    : nameFromPath(filePath, cwd);

  const autoSend = typeof doc.autoSend === "boolean" ? doc.autoSend : false;

  return { filePath, name, method, params, autoSend };
}

/**
 * Scan `cwd` for all *.rpcoon.yaml files (non-recursive) and parse them.
 * Files that fail to parse are silently skipped.
 */
export function scanRequestFiles(cwd: string): RequestFile[] {
  let entries: string[];
  try {
    entries = fs.readdirSync(cwd);
  } catch {
    return [];
  }

  return entries
    .filter(e => e.endsWith(".rpcoon.yaml"))
    .sort()
    .map(e => parseRequestFile(path.join(cwd, e), cwd))
    .filter((f): f is RequestFile => f !== null);
}

/**
 * Serialise a RequestFile back to YAML text suitable for writing to disk.
 * The `name` field is omitted when it matches the filename-derived name.
 */
export function serializeRequestFile(rf: RequestFile): string {
  const cwd = path.dirname(rf.filePath);
  const derivedName = nameFromPath(rf.filePath, cwd);
  const includeName = rf.name !== derivedName;

  // Parse params YAML string back to a JS value so YAML round-trips cleanly
  let paramsValue: unknown;
  if (rf.params.trim() !== "") {
    try {
      paramsValue = parse(rf.params);
    } catch {
      paramsValue = rf.params; // fallback: store as plain string
    }
  }

  const doc: Record<string, unknown> = {};
  if (includeName) doc["name"] = rf.name;
  doc["method"] = rf.method;
  if (paramsValue !== undefined && paramsValue !== null) {
    doc["params"] = paramsValue;
  }
  if (rf.autoSend) doc["autoSend"] = true;

  return stringify(doc, { indent: 2 });
}

/**
 * Write a RequestFile to its `filePath`.
 * Throws on I/O errors (callers are responsible for error handling).
 */
export function saveRequestFile(rf: RequestFile): void {
  const content = serializeRequestFile(rf);
  fs.writeFileSync(rf.filePath, content, "utf-8");
}

/**
 * Save a request to a new file inside `cwd`.
 * Appends `.rpcoon.yaml` if not already present in `filename`.
 * Returns the resulting RequestFile (with the resolved filePath).
 */
export function saveRequestFileAs(
  filename: string,
  method: string,
  params: string,
  cwd: string,
): RequestFile {
  const normalized = filename.endsWith(".rpcoon.yaml")
    ? filename
    : `${filename}.rpcoon.yaml`;
  const filePath = path.isAbsolute(normalized)
    ? normalized
    : path.join(cwd, normalized);
  const name = nameFromPath(filePath, cwd);
  const rf: RequestFile = { filePath, name, method, params, autoSend: false };
  saveRequestFile(rf);
  return rf;
}
