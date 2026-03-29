// Entry point — parses CLI args and mounts the TUI application

import React from "react";
import { render } from "ink";
import { App } from "./app.js";

const url = process.argv[2] ?? "";

if (url === "") {
  process.stderr.write("Usage: rpcon <url>\n");
  process.exit(1);
}

console.clear();
render(React.createElement(App, { url }));
