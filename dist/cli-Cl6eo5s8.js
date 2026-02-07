import { o as createSubsystemLogger } from "./entry.js";
import "./auth-profiles-CbjyhfM5.js";
import "./utils-DX85MiPR.js";
import "./exec-B8JKbXKW.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-xzSh3IZK.js";
import "./github-copilot-token-SLWintYd.js";
import "./pi-model-discovery-DzEIEgHL.js";
import { i as loadConfig } from "./config-BK7bfee5.js";
import "./manifest-registry-C69Z-I4v.js";
import "./server-context-yKyxyxOJ.js";
import "./errors-CZ9opC6L.js";
import "./control-service-C411KAd7.js";
import "./client-CxbkcEZ7.js";
import "./call-BJSLz4K5.js";
import "./message-channel-BlgPSDAh.js";
import "./links-D0uzJbi6.js";
import "./plugins-DmOwDqqs.js";
import "./logging-CfEk_PnX.js";
import "./accounts-MJ4mYpJN.js";
import { t as loadOpenClawPlugins } from "./loader-PqvF84Si.js";
import "./progress-Da1ehW-x.js";
import "./prompt-style-Dc0C5HC9.js";
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

//#region src/plugins/cli.ts
const log = createSubsystemLogger("plugins");
function registerPluginCliCommands(program, cfg) {
	const config = cfg ?? loadConfig();
	const workspaceDir = resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config));
	const logger = {
		info: (msg) => log.info(msg),
		warn: (msg) => log.warn(msg),
		error: (msg) => log.error(msg),
		debug: (msg) => log.debug(msg)
	};
	const registry = loadOpenClawPlugins({
		config,
		workspaceDir,
		logger
	});
	const existingCommands = new Set(program.commands.map((cmd) => cmd.name()));
	for (const entry of registry.cliRegistrars) {
		if (entry.commands.length > 0) {
			const overlaps = entry.commands.filter((command) => existingCommands.has(command));
			if (overlaps.length > 0) {
				log.debug(`plugin CLI register skipped (${entry.pluginId}): command already registered (${overlaps.join(", ")})`);
				continue;
			}
		}
		try {
			const result = entry.register({
				program,
				config,
				workspaceDir,
				logger
			});
			if (result && typeof result.then === "function") result.catch((err) => {
				log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
			});
			for (const command of entry.commands) existingCommands.add(command);
		} catch (err) {
			log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
		}
	}
}

//#endregion
export { registerPluginCliCommands };