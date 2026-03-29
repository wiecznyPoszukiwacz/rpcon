// Text cursor movement and editing helpers for multi-line content

/** Return line index and column for a given character position in text */
export function getLineCol(text: string, pos: number): { line: number; col: number } {
  const before = text.slice(0, pos);
  const lines = before.split("\n");
  return { line: lines.length - 1, col: lines[lines.length - 1]!.length };
}

/** Return the character offset of the start of a given line */
function lineStart(text: string, lineIdx: number): number {
  const lines = text.split("\n");
  let offset = 0;
  for (let i = 0; i < lineIdx && i < lines.length; i++) {
    offset += lines[i]!.length + 1; // +1 for \n
  }
  return offset;
}

/** Move cursor one character to the left */
export function cursorLeft(pos: number): number {
  return Math.max(0, pos - 1);
}

/** Move cursor one character to the right */
export function cursorRight(text: string, pos: number): number {
  return Math.min(text.length, pos + 1);
}

/** Move cursor up one line, preserving column */
export function cursorUp(text: string, pos: number): number {
  const { line, col } = getLineCol(text, pos);
  if (line === 0) return 0;
  const prevStart = lineStart(text, line - 1);
  const prevLen = text.split("\n")[line - 1]!.length;
  return prevStart + Math.min(col, prevLen);
}

/** Move cursor down one line, preserving column */
export function cursorDown(text: string, pos: number): number {
  const { line, col } = getLineCol(text, pos);
  const lines = text.split("\n");
  if (line >= lines.length - 1) return text.length;
  const nextStart = lineStart(text, line + 1);
  const nextLen = lines[line + 1]!.length;
  return nextStart + Math.min(col, nextLen);
}

/** Insert a string at position; return [newText, newCursorPos] */
export function insertAt(text: string, pos: number, str: string): [string, number] {
  return [text.slice(0, pos) + str + text.slice(pos), pos + str.length];
}

/** Delete character before cursor (backspace); return [newText, newCursorPos] */
export function deleteBackward(text: string, pos: number): [string, number] {
  if (pos === 0) return [text, 0];
  return [text.slice(0, pos - 1) + text.slice(pos), pos - 1];
}

/** Delete character at cursor (delete key); return new text */
export function deleteForward(text: string, pos: number): string {
  if (pos >= text.length) return text;
  return text.slice(0, pos) + text.slice(pos + 1);
}
