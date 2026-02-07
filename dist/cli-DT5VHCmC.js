import "./pi-embedded-helpers-BINPWZGz.js";
import { it as loadOpenClawPlugins } from "./reply-D5DQmXpo.js";
import "./paths-scjhy7N2.js";
import { t as createSubsystemLogger } from "./subsystem-CAq3uyo7.js";
import "./utils-CKSrBNwq.js";
import "./exec-HEWTMJ7j.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-4nAkb5YL.js";
import "./model-selection-RM_zZLQN.js";
import "./github-copilot-token-pGSmVaW-.js";
import "./boolean-BgXe2hyu.js";
import "./env-0_mKbEWW.js";
import { i as loadConfig } from "./config-B1A9pWK-.js";
import "./manifest-registry-DHaa1SJb.js";
import "./plugins-BlF-ZPkH.js";
import "./sandbox-7ysDY42x.js";
import "./image-Dm4oIWJ9.js";
import "./pi-model-discovery-CV2V1HHz.js";
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
import "./deliver-DsD2VjZR.js";
import "./dispatcher-Cf2jY4zv.js";
import "./manager-BPpOqZ0z.js";
import "./sqlite-BKl1HJFe.js";
import "./channel-summary-BAdcnl-B.js";
import "./client-BYVbRnuQ.js";
import "./call-DtqJOzE9.js";
import "./login-qr-DavXRBZq.js";
import "./pairing-store-DwvRrpqV.js";
import "./links-B5pRdmo1.js";
import "./progress-xpLtQsNY.js";
import "./pi-tools.policy-nqJPBQaE.js";
import "./prompt-style-vzh0MGHs.js";
import "./pairing-labels-CCiIuKc3.js";
import "./session-cost-usage-C5MMXOZi.js";
import "./control-service-Cvxcu5h2.js";
import "./channel-selection-BPXp-Ft6.js";

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