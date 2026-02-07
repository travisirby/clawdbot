import { k as theme, p as defaultRuntime } from "./entry.js";
import "./auth-profiles-CbjyhfM5.js";
import "./utils-DX85MiPR.js";
import "./exec-B8JKbXKW.js";
import "./agent-scope-xzSh3IZK.js";
import "./github-copilot-token-SLWintYd.js";
import "./config-BK7bfee5.js";
import "./manifest-registry-C69Z-I4v.js";
import "./server-context-yKyxyxOJ.js";
import "./errors-CZ9opC6L.js";
import "./client-CxbkcEZ7.js";
import "./call-BJSLz4K5.js";
import "./message-channel-BlgPSDAh.js";
import { t as formatDocsLink } from "./links-D0uzJbi6.js";
import "./plugins-DmOwDqqs.js";
import "./logging-CfEk_PnX.js";
import "./accounts-MJ4mYpJN.js";
import "./paths-BhxDUiio.js";
import "./routes-BqCULFri.js";
import "./pi-embedded-helpers-BdEtYGar.js";
import "./sandbox-CAzTXzmk.js";
import "./channel-summary-B_C4bXX1.js";
import "./skills-CmU0Q92f.js";
import "./redact-B8YiFlwn.js";
import "./tool-display-DmgKs6-V.js";
import { t as parseTimeoutMs } from "./parse-timeout-CbVKLZ4B.js";
import { t as runTui } from "./tui-D2aYfza-.js";

//#region src/cli/tui-cli.ts
function registerTuiCli(program) {
	program.command("tui").description("Open a terminal UI connected to the Gateway").option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (if required)").option("--session <key>", "Session key (default: \"main\", or \"global\" when scope is global)").option("--deliver", "Deliver assistant replies", false).option("--thinking <level>", "Thinking level override").option("--message <text>", "Send an initial message after connecting").option("--timeout-ms <ms>", "Agent timeout in ms (defaults to agents.defaults.timeoutSeconds)").option("--history-limit <n>", "History entries to load", "200").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/tui", "docs.openclaw.ai/cli/tui")}\n`).action(async (opts) => {
		try {
			const timeoutMs = parseTimeoutMs(opts.timeoutMs);
			if (opts.timeoutMs !== void 0 && timeoutMs === void 0) defaultRuntime.error(`warning: invalid --timeout-ms "${String(opts.timeoutMs)}"; ignoring`);
			const historyLimit = Number.parseInt(String(opts.historyLimit ?? "200"), 10);
			await runTui({
				url: opts.url,
				token: opts.token,
				password: opts.password,
				session: opts.session,
				deliver: Boolean(opts.deliver),
				thinking: opts.thinking,
				message: opts.message,
				timeoutMs,
				historyLimit: Number.isNaN(historyLimit) ? void 0 : historyLimit
			});
		} catch (err) {
			defaultRuntime.error(String(err));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
export { registerTuiCli };