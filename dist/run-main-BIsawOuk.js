import { c as enableConsoleCapture, i as normalizeEnv, n as isTruthyEnvValue, p as defaultRuntime } from "./entry.js";
import "./auth-profiles-CbjyhfM5.js";
import { d as resolveConfigDir } from "./utils-DX85MiPR.js";
import "./exec-B8JKbXKW.js";
import "./agent-scope-xzSh3IZK.js";
import "./github-copilot-token-SLWintYd.js";
import "./pi-model-discovery-DzEIEgHL.js";
import { j as VERSION } from "./config-BK7bfee5.js";
import "./manifest-registry-C69Z-I4v.js";
import "./server-context-yKyxyxOJ.js";
import { r as formatUncaughtError } from "./errors-CZ9opC6L.js";
import "./control-service-C411KAd7.js";
import { t as ensureOpenClawCliOnPath } from "./path-env-h3xp5PqO.js";
import "./tailscale-9MusRvOi.js";
import "./auth-DksjO6WG.js";
import "./client-CxbkcEZ7.js";
import "./call-BJSLz4K5.js";
import "./message-channel-BlgPSDAh.js";
import "./links-D0uzJbi6.js";
import "./plugin-auto-enable-DHSSP121.js";
import "./plugins-DmOwDqqs.js";
import "./logging-CfEk_PnX.js";
import "./accounts-MJ4mYpJN.js";
import { jt as installUnhandledRejectionHandler } from "./loader-PqvF84Si.js";
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
import { a as getCommandPath, c as getPrimaryCommand, d as hasHelpOrVersion } from "./register.subclis-B3nOjivx.js";
import "./completion-cli-B9IXLgiC.js";
import "./gateway-rpc-BjPZ6XIf.js";
import "./deps-DwpIwq-u.js";
import { h as assertSupportedRuntime } from "./daemon-runtime-BcBr8yJC.js";
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
import "./auth-health-CIn7SX93.js";
import { a as findRoutedCommand, n as emitCliBanner, t as ensureConfigReady } from "./config-guard-CJYu2rlV.js";
import "./help-format-CfZ94KRN.js";
import "./configure-unxWJGAP.js";
import "./systemd-linger-SsSOsJST.js";
import "./doctor-DHRmJRXe.js";
import path from "node:path";
import process$1 from "node:process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

//#region src/infra/dotenv.ts
function loadDotEnv(opts) {
	const quiet = opts?.quiet ?? true;
	dotenv.config({ quiet });
	const globalEnvPath = path.join(resolveConfigDir(process.env), ".env");
	if (!fs.existsSync(globalEnvPath)) return;
	dotenv.config({
		quiet,
		path: globalEnvPath,
		override: false
	});
}

//#endregion
//#region src/cli/route.ts
async function prepareRoutedCommand(params) {
	emitCliBanner(VERSION, { argv: params.argv });
	await ensureConfigReady({
		runtime: defaultRuntime,
		commandPath: params.commandPath
	});
	if (params.loadPlugins) ensurePluginRegistryLoaded();
}
async function tryRouteCli(argv) {
	if (isTruthyEnvValue(process.env.OPENCLAW_DISABLE_ROUTE_FIRST)) return false;
	if (hasHelpOrVersion(argv)) return false;
	const path = getCommandPath(argv, 2);
	if (!path[0]) return false;
	const route = findRoutedCommand(path);
	if (!route) return false;
	await prepareRoutedCommand({
		argv,
		commandPath: path,
		loadPlugins: route.loadPlugins
	});
	return route.run(argv);
}

//#endregion
//#region src/cli/run-main.ts
function rewriteUpdateFlagArgv(argv) {
	const index = argv.indexOf("--update");
	if (index === -1) return argv;
	const next = [...argv];
	next.splice(index, 1, "update");
	return next;
}
async function runCli(argv = process$1.argv) {
	const normalizedArgv = stripWindowsNodeExec(argv);
	loadDotEnv({ quiet: true });
	normalizeEnv();
	ensureOpenClawCliOnPath();
	assertSupportedRuntime();
	if (await tryRouteCli(normalizedArgv)) return;
	enableConsoleCapture();
	const { buildProgram } = await import("./program-Bc-1h7tG.js");
	const program = buildProgram();
	installUnhandledRejectionHandler();
	process$1.on("uncaughtException", (error) => {
		console.error("[openclaw] Uncaught exception:", formatUncaughtError(error));
		process$1.exit(1);
	});
	const parseArgv = rewriteUpdateFlagArgv(normalizedArgv);
	const primary = getPrimaryCommand(parseArgv);
	if (primary) {
		const { registerSubCliByName } = await import("./register.subclis-B3nOjivx.js").then((n) => n.i);
		await registerSubCliByName(program, primary);
	}
	if (!(!primary && hasHelpOrVersion(parseArgv))) {
		const { registerPluginCliCommands } = await import("./cli-Cl6eo5s8.js");
		const { loadConfig } = await import("./config-BK7bfee5.js").then((n) => n.t);
		registerPluginCliCommands(program, loadConfig());
	}
	await program.parseAsync(parseArgv);
}
function stripWindowsNodeExec(argv) {
	if (process$1.platform !== "win32") return argv;
	const stripControlChars = (value) => {
		let out = "";
		for (let i = 0; i < value.length; i += 1) {
			const code = value.charCodeAt(i);
			if (code >= 32 && code !== 127) out += value[i];
		}
		return out;
	};
	const normalizeArg = (value) => stripControlChars(value).replace(/^['"]+|['"]+$/g, "").trim();
	const normalizeCandidate = (value) => normalizeArg(value).replace(/^\\\\\\?\\/, "");
	const execPath = normalizeCandidate(process$1.execPath);
	const execPathLower = execPath.toLowerCase();
	const execBase = path.basename(execPath).toLowerCase();
	const isExecPath = (value) => {
		if (!value) return false;
		const normalized = normalizeCandidate(value);
		if (!normalized) return false;
		const lower = normalized.toLowerCase();
		return lower === execPathLower || path.basename(lower) === execBase || lower.endsWith("\\node.exe") || lower.endsWith("/node.exe") || lower.includes("node.exe") || path.basename(lower) === "node.exe" && fs.existsSync(normalized);
	};
	const filtered = argv.filter((arg, index) => index === 0 || !isExecPath(arg));
	if (filtered.length < 3) return filtered;
	const cleaned = [...filtered];
	if (isExecPath(cleaned[1])) cleaned.splice(1, 1);
	if (isExecPath(cleaned[2])) cleaned.splice(2, 1);
	return cleaned;
}

//#endregion
export { runCli };