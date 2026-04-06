// Built-in themes for rpcoon

import type { Theme } from "./types.mjs";

/** Default dark-terminal theme — preserves the original color scheme */
export const defaultTheme: Theme = {
  infoBar: {
    logo:           { color: "cyan" },
    url:            { color: "#555555" },
    method:         { color: "#e8a020" },
    loading:        { color: "yellow" },
    backgroundColor: "#111111",
  },

  separator:    { style: "single", color: "gray" },
  panelDivider: { style: "single", color: "gray" },

  requestPanel: {
    titleActive:   { color: "cyan" },
    titleInactive: { color: "white" },
    hint:          { dimColor: true },
  },

  paramsEditor: {
    cursor: { backgroundColor: "white", color: "black" },
    empty:  { dimColor: true },
  },

  responsePanel: {
    title:          { color: "cyan" },
    duration:       { color: "yellow" },
    transportError: { color: "red" },
    rpcError:       { color: "red" },
    rpcErrorData:   { dimColor: true },
    successResult:  { color: "green" },
    empty:          { dimColor: true },
  },

  statusBar: {
    historyMode:  { color: "cyan" },
    loading:      { color: "yellow" },
    error:        { color: "red" },
    paramsActive: { dimColor: true },
    default:      { dimColor: true },
  },

  historyPopup: {
    border:         { style: "single", color: "cyan", backgroundColor: "black" },
    header:         { color: "cyan" },
    successIcon:    { color: "green" },
    errorIcon:      { color: "red" },
    selectedMethod: { inverse: true },
    activeMethod:   { color: "white" },
    inactiveMethod: { color: "gray" },
    meta:           { dimColor: true },
    empty:          { dimColor: true },
  },

  methodPopup: {
    border:               { style: "single", color: "cyan", backgroundColor: "black" },
    header:               { color: "cyan" },
    inputBorderFocused:   { style: "single", color: "cyan" },
    inputBorderUnfocused: { style: "single", color: "gray" },
    cursor:               { color: "cyan" },
    selectedItem:         { inverse: true, color: "cyan" },
    unselectedItem:       { color: "gray" },
    empty:                { dimColor: true },
  },

  requestPickerPopup: {
    border:         { style: "single", color: "cyan", backgroundColor: "black" },
    divider:        { style: "single", color: "gray" },
    header:         { color: "cyan" },
    selectedItem:   { inverse: true, color: "cyan" },
    unselectedItem: { color: "gray" },
    previewMethod:  { color: "white" },
    previewParams:  { color: "white" },
    previewLabel:   { dimColor: true },
    empty:          { dimColor: true },
    dirtyIndicator: { color: "yellow" },
  },

  commandLine: {
    prompt:                { color: "cyan" },
    inputText:             { color: "white" },
    cursor:                { backgroundColor: "white", color: "black" },
    completionBorder:      { style: "single", color: "cyan", backgroundColor: "black" },
    selectedName:          { inverse: true, color: "cyan" },
    selectedDescription:   { inverse: true, color: "white" },
    unselectedName:        { color: "cyan" },
    unselectedDescription: { color: "gray" },
  },
};

// ── Ayu Mirage ────────────────────────────────────────────────────────────────
// https://github.com/ayu-theme/ayu-colors
// bg: #1f2430  fg: #cbccc6  comment: #5c6773  selection: #33415e
// red: #ff3333  orange: #ffae57  yellow: #ffd580  green: #bae67e
// cyan: #5ccfe6  accent: #ffcc66  purple: #d4bfff

/** Ayu Mirage dark theme */
export const ayuMirageTheme: Theme = {
  infoBar: {
    logo:           { color: "#ffcc66" },
    url:            { color: "#5c6773" },
    method:         { color: "#ffae57" },
    loading:        { color: "#ffd580" },
    backgroundColor: "#191e2a",
  },

  separator:    { style: "single", color: "#33415e" },
  panelDivider: { style: "single", color: "#33415e" },

  requestPanel: {
    titleActive:   { color: "#5ccfe6" },
    titleInactive: { color: "#cbccc6" },
    hint:          { color: "#5c6773" },
  },

  paramsEditor: {
    cursor: { backgroundColor: "#5ccfe6", color: "#1f2430" },
    empty:  { color: "#5c6773" },
  },

  responsePanel: {
    title:          { color: "#5ccfe6" },
    duration:       { color: "#ffcc66" },
    transportError: { color: "#ff3333" },
    rpcError:       { color: "#ff3333" },
    rpcErrorData:   { color: "#5c6773" },
    successResult:  { color: "#bae67e" },
    empty:          { color: "#5c6773" },
  },

  statusBar: {
    historyMode:  { color: "#5ccfe6" },
    loading:      { color: "#ffd580" },
    error:        { color: "#ff3333" },
    paramsActive: { color: "#5c6773" },
    default:      { color: "#5c6773" },
  },

  historyPopup: {
    border:         { style: "single", color: "#5ccfe6", backgroundColor: "#1f2430" },
    header:         { color: "#5ccfe6" },
    successIcon:    { color: "#bae67e" },
    errorIcon:      { color: "#ff3333" },
    selectedMethod: { inverse: true, color: "#ffcc66" },
    activeMethod:   { color: "#cbccc6" },
    inactiveMethod: { color: "#5c6773" },
    meta:           { color: "#5c6773" },
    empty:          { color: "#5c6773" },
  },

  methodPopup: {
    border:               { style: "single", color: "#5ccfe6", backgroundColor: "#1f2430" },
    header:               { color: "#5ccfe6" },
    inputBorderFocused:   { style: "single", color: "#5ccfe6" },
    inputBorderUnfocused: { style: "single", color: "#33415e" },
    cursor:               { color: "#ffcc66" },
    selectedItem:         { inverse: true, color: "#ffcc66" },
    unselectedItem:       { color: "#5c6773" },
    empty:                { color: "#5c6773" },
  },

  requestPickerPopup: {
    border:         { style: "single", color: "#5ccfe6", backgroundColor: "#1f2430" },
    divider:        { style: "single", color: "#33415e" },
    header:         { color: "#5ccfe6" },
    selectedItem:   { inverse: true, color: "#ffcc66" },
    unselectedItem: { color: "#5c6773" },
    previewMethod:  { color: "#cbccc6" },
    previewParams:  { color: "#cbccc6" },
    previewLabel:   { color: "#5c6773" },
    empty:          { color: "#5c6773" },
    dirtyIndicator: { color: "#ffd580" },
  },

  commandLine: {
    prompt:                { color: "#5ccfe6" },
    inputText:             { color: "#cbccc6" },
    cursor:                { backgroundColor: "#5ccfe6", color: "#1f2430" },
    completionBorder:      { style: "single", color: "#5ccfe6", backgroundColor: "#1f2430" },
    selectedName:          { inverse: true, color: "#ffcc66" },
    selectedDescription:   { inverse: true, color: "#cbccc6" },
    unselectedName:        { color: "#5ccfe6" },
    unselectedDescription: { color: "#5c6773" },
  },
};

// ── Nord ──────────────────────────────────────────────────────────────────────
// https://www.nordtheme.com/docs/colors-and-palettes
// Polar Night: #2e3440 #3b4252 #434c5e #4c566a
// Snow Storm:  #d8dee9 #e5e9f0 #eceff4
// Frost:       #8fbcbb #88c0d0 #81a1c1 #5e81ac
// Aurora:      #bf616a #d08770 #ebcb8b #a3be8c #b48ead

/** Nord dark theme */
export const nordTheme: Theme = {
  infoBar: {
    logo:           { color: "#88c0d0" },
    url:            { color: "#4c566a" },
    method:         { color: "#ebcb8b" },
    loading:        { color: "#ebcb8b" },
    backgroundColor: "#2e3440",
  },

  separator:    { style: "single", color: "#3b4252" },
  panelDivider: { style: "single", color: "#3b4252" },

  requestPanel: {
    titleActive:   { color: "#88c0d0" },
    titleInactive: { color: "#d8dee9" },
    hint:          { color: "#4c566a" },
  },

  paramsEditor: {
    cursor: { backgroundColor: "#88c0d0", color: "#2e3440" },
    empty:  { color: "#4c566a" },
  },

  responsePanel: {
    title:          { color: "#88c0d0" },
    duration:       { color: "#ebcb8b" },
    transportError: { color: "#bf616a" },
    rpcError:       { color: "#bf616a" },
    rpcErrorData:   { color: "#4c566a" },
    successResult:  { color: "#a3be8c" },
    empty:          { color: "#4c566a" },
  },

  statusBar: {
    historyMode:  { color: "#88c0d0" },
    loading:      { color: "#ebcb8b" },
    error:        { color: "#bf616a" },
    paramsActive: { color: "#4c566a" },
    default:      { color: "#4c566a" },
  },

  historyPopup: {
    border:         { style: "single", color: "#88c0d0", backgroundColor: "#2e3440" },
    header:         { color: "#88c0d0" },
    successIcon:    { color: "#a3be8c" },
    errorIcon:      { color: "#bf616a" },
    selectedMethod: { inverse: true, color: "#88c0d0" },
    activeMethod:   { color: "#d8dee9" },
    inactiveMethod: { color: "#4c566a" },
    meta:           { color: "#4c566a" },
    empty:          { color: "#4c566a" },
  },

  methodPopup: {
    border:               { style: "single", color: "#88c0d0", backgroundColor: "#2e3440" },
    header:               { color: "#88c0d0" },
    inputBorderFocused:   { style: "single", color: "#88c0d0" },
    inputBorderUnfocused: { style: "single", color: "#3b4252" },
    cursor:               { color: "#88c0d0" },
    selectedItem:         { inverse: true, color: "#88c0d0" },
    unselectedItem:       { color: "#4c566a" },
    empty:                { color: "#4c566a" },
  },

  requestPickerPopup: {
    border:         { style: "single", color: "#88c0d0", backgroundColor: "#2e3440" },
    divider:        { style: "single", color: "#3b4252" },
    header:         { color: "#88c0d0" },
    selectedItem:   { inverse: true, color: "#88c0d0" },
    unselectedItem: { color: "#4c566a" },
    previewMethod:  { color: "#d8dee9" },
    previewParams:  { color: "#d8dee9" },
    previewLabel:   { color: "#4c566a" },
    empty:          { color: "#4c566a" },
    dirtyIndicator: { color: "#ebcb8b" },
  },

  commandLine: {
    prompt:                { color: "#88c0d0" },
    inputText:             { color: "#d8dee9" },
    cursor:                { backgroundColor: "#88c0d0", color: "#2e3440" },
    completionBorder:      { style: "single", color: "#88c0d0", backgroundColor: "#2e3440" },
    selectedName:          { inverse: true, color: "#88c0d0" },
    selectedDescription:   { inverse: true, color: "#d8dee9" },
    unselectedName:        { color: "#88c0d0" },
    unselectedDescription: { color: "#4c566a" },
  },
};

/** All built-in themes by name */
export const themes: Record<string, Theme> = {
  default:    defaultTheme,
  "ayu-mirage": ayuMirageTheme,
  nord:       nordTheme,
};
