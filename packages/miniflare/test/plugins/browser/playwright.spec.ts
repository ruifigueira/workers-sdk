import path from "node:path";
import test from "ava";
import esbuild from "esbuild";
import { Miniflare } from "miniflare";
import { useTmp } from "../../test-shared";

const FIXTURES_PATH = path.resolve(
	__dirname,
	"..",
	"..",
	"..",
	"..",
	"test",
	"fixtures",
	"browser"
);

const PLAYWRIGHT_ENTRY_PATH = path.join(FIXTURES_PATH, "playwright.ts");

test("it creates a browser session and closes", async (t) => {
	const tmp = await useTmp(t);
	await esbuild.build({
		entryPoints: [PLAYWRIGHT_ENTRY_PATH],
		format: "esm",
		external: [
			"node:async_hooks",
			"node:assert",
			"node:browser",
			"node:buffer",
			"node:child_process",
			"node:constants",
			"node:crypto",
			"node:dns",
			"node:events",
			"node:http",
			"node:http2",
			"node:https",
			"node:inspector",
			"node:module",
			"node:net",
			"node:os",
			"node:path",
			"node:process",
			"node:readline",
			"node:stream",
			"node:timers",
			"node:tls",
			"node:url",
			"node:util",
			"node:zlib",
			"cloudflare:workers",
		],
		bundle: true,
		sourcemap: true,
		outdir: tmp,
	});
	const scriptPath = path.join(tmp, "playwright.js");
	const mf = new Miniflare({
		modules: true,
		name: "worker",
		compatibilityDate: "2025-05-01",
		compatibilityFlags: ["nodejs_compat"],
		browserRendering: { binding: "MYBROWSER" },
		scriptPath,
	});
	t.teardown(() => mf.dispose());

	const res = await mf.dispatchFetch("https://localhost/");
	t.is(await res.text(), "The meaning of life is 42");
});
