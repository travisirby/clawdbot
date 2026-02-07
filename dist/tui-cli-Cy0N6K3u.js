import "./pi-embedded-helpers-BINPWZGz.js";
import "./paths-scjhy7N2.js";
import { R as theme, c as defaultRuntime } from "./subsystem-CAq3uyo7.js";
import "./utils-CKSrBNwq.js";
import "./exec-HEWTMJ7j.js";
import "./agent-scope-4nAkb5YL.js";
import "./model-selection-RM_zZLQN.js";
import "./github-copilot-token-pGSmVaW-.js";
import "./boolean-BgXe2hyu.js";
import "./env-0_mKbEWW.js";
import "./config-B1A9pWK-.js";
import "./manifest-registry-DHaa1SJb.js";
import "./plugins-BlF-ZPkH.js";
import "./sandbox-7ysDY42x.js";
import "./chrome-BNSd7Bie.js";
import "./skills-D5JDj3TR.js";
import "./routes-D-UAHT8-.js";
import "./server-context-vChIAqjH.js";
import "./message-channel-Bpfe5l5f.js";
import "./logging-BWRYHvLp.js";
import "./accounts-DkUtJa-O.js";
import "./paths-CR6bsrfc.js";
import "./redact-DJCFY628.js";
import "./tool-display-BxZG0o1b.js";
import "./channel-summary-BAdcnl-B.js";
import "./client-BYVbRnuQ.js";
import "./call-DtqJOzE9.js";
import { t as formatDocsLink } from "./links-B5pRdmo1.js";
import { t as parseTimeoutMs } from "./parse-timeout-Du-wHHNi.js";
import { t as runTui } from "./tui-CZSiGSHy.js";

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