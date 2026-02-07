import { it as loadOpenClawPlugins } from "./reply-D5DQmXpo.js";
import { t as createSubsystemLogger } from "./subsystem-CAq3uyo7.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir, w as resolveDefaultAgentWorkspaceDir } from "./agent-scope-4nAkb5YL.js";
import { i as loadConfig } from "./config-B1A9pWK-.js";

//#region src/plugins/status.ts
const log = createSubsystemLogger("plugins");
function buildPluginStatusReport(params) {
	const config = params?.config ?? loadConfig();
	const workspaceDir = params?.workspaceDir ? params.workspaceDir : resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config)) ?? resolveDefaultAgentWorkspaceDir();
	return {
		workspaceDir,
		...loadOpenClawPlugins({
			config,
			workspaceDir,
			logger: {
				info: (msg) => log.info(msg),
				warn: (msg) => log.warn(msg),
				error: (msg) => log.error(msg),
				debug: (msg) => log.debug(msg)
			}
		})
	};
}

//#endregion
export { buildPluginStatusReport as t };