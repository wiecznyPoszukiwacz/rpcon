// Entry point — parses CLI args and mounts the TUI application

import React from "react";
import { render } from "ink";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { App } from "./app.js";
import type { THooks } from "./types.mjs";

const url = process.argv[2] ?? "";

async function loadHooks(): Promise<THooks> {
	const hookPath = join(process.cwd(), "hooks.rpcon.mjs");
	try {
		const mod = await import(pathToFileURL(hookPath).href) as THooks;
		return {
			baseUrl: mod.baseUrl,
			beforeRequest: mod.beforeRequest,
			afterResponse: mod.afterResponse,
		};
	} catch {
		return {};
	}
}

const hooks = await loadHooks();

// resolve URL: CLI arg takes precedence over hooks.baseUrl
const resolvedUrl = url !== ""
	? url
	: typeof hooks.baseUrl === "function"
		? hooks.baseUrl()
		: (hooks.baseUrl ?? "");

if (resolvedUrl === "") {
	process.stderr.write("Usage: rpcon <url>\n       or export baseUrl from hooks.rpcon.mjs\n");
	process.exit(1);
}

console.clear();
render(React.createElement(App, { url: resolvedUrl, hooks }));
