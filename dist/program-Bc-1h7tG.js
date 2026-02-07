import { C as setVerbose, O as isRich, k as theme, n as isTruthyEnvValue, p as defaultRuntime } from "./entry.js";
import "./auth-profiles-CbjyhfM5.js";
import { n as replaceCliName, r as resolveCliName } from "./command-format-ayFsmwwz.js";
import "./utils-DX85MiPR.js";
import "./exec-B8JKbXKW.js";
import "./agent-scope-xzSh3IZK.js";
import "./github-copilot-token-SLWintYd.js";
import "./pi-model-discovery-DzEIEgHL.js";
import { j as VERSION } from "./config-BK7bfee5.js";
import "./manifest-registry-C69Z-I4v.js";
import "./server-context-yKyxyxOJ.js";
import "./errors-CZ9opC6L.js";
import "./control-service-C411KAd7.js";
import "./tailscale-9MusRvOi.js";
import "./auth-DksjO6WG.js";
import "./client-CxbkcEZ7.js";
import "./call-BJSLz4K5.js";
import "./message-channel-BlgPSDAh.js";
import { t as formatDocsLink } from "./links-D0uzJbi6.js";
import "./plugin-auto-enable-DHSSP121.js";
import "./plugins-DmOwDqqs.js";
import "./logging-CfEk_PnX.js";
import "./accounts-MJ4mYpJN.js";
import "./loader-PqvF84Si.js";
import "./progress-Da1ehW-x.js";
import "./prompt-style-Dc0C5HC9.js";
import "./note-Ci08TSbV.js";
import "./clack-prompter-DuBVnTKy.js";
import "./onboard-channels-TDSi2_lP.js";
import "./archive-D0z3LZDK.js";
import "./skill-scanner-Bp1D9gra.js";
import "./installs-DsJkyWfL.js";
import "./manager-BXba1-tM.js";
import "./paths-BhxDUiio.js";
import "./sqlite-DqUEZnjO.js";
import "./routes-BqCULFri.js";
import "./pi-embedded-helpers-BdEtYGar.js";
import "./deliver-gTKS6yGz.js";
import "./sandbox-CAzTXzmk.js";
import "./channel-summary-B_C4bXX1.js";
import "./wsl-BqAv8Zjj.js";
import "./skills-CmU0Q92f.js";
import "./image-DoRPYGpv.js";
import "./redact-B8YiFlwn.js";
import "./tool-display-DmgKs6-V.js";
import "./channel-selection-ucXSmjx7.js";
import "./session-cost-usage-C9bgCj2T.js";
import "./commands-CByaGyAZ.js";
import "./pairing-store-CDcJ_3K0.js";
import "./login-qr-BZWxby9I.js";
import "./pairing-labels-bw3QFLZ0.js";
import "./channels-status-issues-NwwdCTbZ.js";
import { n as ensurePluginRegistryLoaded } from "./command-options-Bxm1y9Bh.js";
import { n as resolveCliChannelOptions } from "./channel-options-CdFt8iew.js";
import { a as getCommandPath, d as hasHelpOrVersion, l as getVerboseFlag } from "./register.subclis-B3nOjivx.js";
import "./completion-cli-B9IXLgiC.js";
import "./gateway-rpc-BjPZ6XIf.js";
import "./deps-DwpIwq-u.js";
import "./daemon-runtime-BcBr8yJC.js";
import "./service-_JwSmGSn.js";
import "./systemd-8sIc6isV.js";
import "./service-audit-CiV3R13m.js";
import "./table-CJSx0YID.js";
import "./widearea-dns-CsSylzXH.js";
import "./audit-CiOqbn9_.js";
import "./onboard-skills-BQDd1fcD.js";
import "./health-format-B5Hg8mtj.js";
import "./update-runner-BNcrduqF.js";
import "./github-copilot-auth-BVzge74E.js";
import "./logging-Cc7m6PTv.js";
import "./hooks-status-CKmUPU-M.js";
import "./status-65c4p3r_.js";
import "./skills-status-DtXrj3fy.js";
import "./tui-D2aYfza-.js";
import "./agent-BFEwY-__.js";
import "./node-service-Lc1LlnFH.js";
import { t as forceFreePort } from "./ports-0V-Mu4ch.js";
import "./auth-health-CIn7SX93.js";
import { i as hasEmittedCliBanner, n as emitCliBanner, o as registerProgramCommands, r as formatCliBannerLine, t as ensureConfigReady } from "./config-guard-CJYu2rlV.js";
import "./help-format-CfZ94KRN.js";
import "./configure-unxWJGAP.js";
import "./systemd-linger-SsSOsJST.js";
import "./doctor-DHRmJRXe.js";
import { Command } from "commander";

//#region src/cli/program/context.ts
function createProgramContext() {
	const channelOptions = resolveCliChannelOptions();
	return {
		programVersion: VERSION,
		channelOptions,
		messageChannelOptions: channelOptions.join("|"),
		agentChannelOptions: ["last", ...channelOptions].join("|")
	};
}

//#endregion
//#region src/cli/program/help.ts
const CLI_NAME = resolveCliName();
const EXAMPLES = [
	["openclaw channels login --verbose", "Link personal WhatsApp Web and show QR + connection logs."],
	["openclaw message send --target +15555550123 --message \"Hi\" --json", "Send via your web session and print JSON result."],
	["openclaw gateway --port 18789", "Run the WebSocket Gateway locally."],
	["openclaw --dev gateway", "Run a dev Gateway (isolated state/config) on ws://127.0.0.1:19001."],
	["openclaw gateway --force", "Kill anything bound to the default gateway port, then start it."],
	["openclaw gateway ...", "Gateway control via WebSocket."],
	["openclaw agent --to +15555550123 --message \"Run summary\" --deliver", "Talk directly to the agent using the Gateway; optionally send the WhatsApp reply."],
	["openclaw message send --channel telegram --target @mychat --message \"Hi\"", "Send via your Telegram bot."]
];
function configureProgramHelp(program, ctx) {
	program.name(CLI_NAME).description("").version(ctx.programVersion).option("--dev", "Dev profile: isolate state under ~/.openclaw-dev, default gateway port 19001, and shift derived ports (browser/canvas)").option("--profile <name>", "Use a named profile (isolates OPENCLAW_STATE_DIR/OPENCLAW_CONFIG_PATH under ~/.openclaw-<name>)");
	program.option("--no-color", "Disable ANSI colors", false);
	program.configureHelp({
		sortSubcommands: true,
		sortOptions: true,
		optionTerm: (option) => theme.option(option.flags),
		subcommandTerm: (cmd) => theme.command(cmd.name())
	});
	program.configureOutput({
		writeOut: (str) => {
			const colored = str.replace(/^Usage:/gm, theme.heading("Usage:")).replace(/^Options:/gm, theme.heading("Options:")).replace(/^Commands:/gm, theme.heading("Commands:"));
			process.stdout.write(colored);
		},
		writeErr: (str) => process.stderr.write(str),
		outputError: (str, write) => write(theme.error(str))
	});
	if (process.argv.includes("-V") || process.argv.includes("--version") || process.argv.includes("-v")) {
		console.log(ctx.programVersion);
		process.exit(0);
	}
	program.addHelpText("beforeAll", () => {
		if (hasEmittedCliBanner()) return "";
		const rich = isRich();
		return `\n${formatCliBannerLine(ctx.programVersion, { richTty: rich })}\n`;
	});
	const fmtExamples = EXAMPLES.map(([cmd, desc]) => `  ${theme.command(replaceCliName(cmd, CLI_NAME))}\n    ${theme.muted(desc)}`).join("\n");
	program.addHelpText("afterAll", ({ command }) => {
		if (command !== program) return "";
		const docs = formatDocsLink("/cli", "docs.openclaw.ai/cli");
		return `\n${theme.heading("Examples:")}\n${fmtExamples}\n\n${theme.muted("Docs:")} ${docs}\n`;
	});
}

//#endregion
//#region src/cli/program/preaction.ts
function setProcessTitleForCommand(actionCommand) {
	let current = actionCommand;
	while (current.parent && current.parent.parent) current = current.parent;
	const name = current.name();
	const cliName = resolveCliName();
	if (!name || name === cliName) return;
	process.title = `${cliName}-${name}`;
}
const PLUGIN_REQUIRED_COMMANDS = new Set([
	"message",
	"channels",
	"directory"
]);
function registerPreActionHooks(program, programVersion) {
	program.hook("preAction", async (_thisCommand, actionCommand) => {
		setProcessTitleForCommand(actionCommand);
		const argv = process.argv;
		if (hasHelpOrVersion(argv)) return;
		const commandPath = getCommandPath(argv, 2);
		if (!(isTruthyEnvValue(process.env.OPENCLAW_HIDE_BANNER) || commandPath[0] === "update" || commandPath[0] === "completion" || commandPath[0] === "plugins" && commandPath[1] === "update")) emitCliBanner(programVersion);
		const verbose = getVerboseFlag(argv, { includeDebug: true });
		setVerbose(verbose);
		if (!verbose) process.env.NODE_NO_WARNINGS ??= "1";
		if (commandPath[0] === "doctor" || commandPath[0] === "completion") return;
		await ensureConfigReady({
			runtime: defaultRuntime,
			commandPath
		});
		if (PLUGIN_REQUIRED_COMMANDS.has(commandPath[0])) ensurePluginRegistryLoaded();
	});
}

//#endregion
//#region src/cli/program/build-program.ts
function buildProgram() {
	const program = new Command();
	const ctx = createProgramContext();
	const argv = process.argv;
	configureProgramHelp(program, ctx);
	registerPreActionHooks(program, ctx.programVersion);
	registerProgramCommands(program, ctx, argv);
	return program;
}

//#endregion
export { buildProgram };