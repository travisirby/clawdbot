import "./pi-embedded-helpers-BINPWZGz.js";
import { _ as loadSessionEntry, tt as requestHeartbeatNow, yr as enqueueSystemEvent } from "./reply-D5DQmXpo.js";
import "./paths-scjhy7N2.js";
import { u as normalizeMainKey } from "./session-key-ezJ78bLC.js";
import { c as defaultRuntime } from "./subsystem-CAq3uyo7.js";
import "./utils-CKSrBNwq.js";
import "./exec-HEWTMJ7j.js";
import "./agent-scope-4nAkb5YL.js";
import "./model-selection-RM_zZLQN.js";
import "./github-copilot-token-pGSmVaW-.js";
import "./boolean-BgXe2hyu.js";
import "./env-0_mKbEWW.js";
import { i as loadConfig } from "./config-B1A9pWK-.js";
import "./manifest-registry-DHaa1SJb.js";
import { r as normalizeChannelId } from "./plugins-BlF-ZPkH.js";
import { g as updateSessionStore } from "./sandbox-7ysDY42x.js";
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
import "./deps-Cungkzfd.js";
import { t as agentCommand } from "./agent-CCEnWVbx.js";
import { t as formatForLog } from "./ws-log-DoIdOhb1.js";
import { randomUUID } from "node:crypto";

//#region src/gateway/server-node-events.ts
const handleNodeEvent = async (ctx, nodeId, evt) => {
	switch (evt.event) {
		case "voice.transcript": {
			if (!evt.payloadJSON) return;
			let payload;
			try {
				payload = JSON.parse(evt.payloadJSON);
			} catch {
				return;
			}
			const obj = typeof payload === "object" && payload !== null ? payload : {};
			const text = typeof obj.text === "string" ? obj.text.trim() : "";
			if (!text) return;
			if (text.length > 2e4) return;
			const sessionKeyRaw = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : "";
			const rawMainKey = normalizeMainKey(loadConfig().session?.mainKey);
			const sessionKey = sessionKeyRaw.length > 0 ? sessionKeyRaw : rawMainKey;
			const { storePath, entry, canonicalKey } = loadSessionEntry(sessionKey);
			const now = Date.now();
			const sessionId = entry?.sessionId ?? randomUUID();
			if (storePath) await updateSessionStore(storePath, (store) => {
				store[canonicalKey] = {
					sessionId,
					updatedAt: now,
					thinkingLevel: entry?.thinkingLevel,
					verboseLevel: entry?.verboseLevel,
					reasoningLevel: entry?.reasoningLevel,
					systemSent: entry?.systemSent,
					sendPolicy: entry?.sendPolicy,
					lastChannel: entry?.lastChannel,
					lastTo: entry?.lastTo
				};
			});
			ctx.addChatRun(sessionId, {
				sessionKey,
				clientRunId: `voice-${randomUUID()}`
			});
			agentCommand({
				message: text,
				sessionId,
				sessionKey,
				thinking: "low",
				deliver: false,
				messageChannel: "node"
			}, defaultRuntime, ctx.deps).catch((err) => {
				ctx.logGateway.warn(`agent failed node=${nodeId}: ${formatForLog(err)}`);
			});
			return;
		}
		case "agent.request": {
			if (!evt.payloadJSON) return;
			let link = null;
			try {
				link = JSON.parse(evt.payloadJSON);
			} catch {
				return;
			}
			const message = (link?.message ?? "").trim();
			if (!message) return;
			if (message.length > 2e4) return;
			const channel = normalizeChannelId(typeof link?.channel === "string" ? link.channel.trim() : "") ?? void 0;
			const to = typeof link?.to === "string" && link.to.trim() ? link.to.trim() : void 0;
			const deliver = Boolean(link?.deliver) && Boolean(channel);
			const sessionKeyRaw = (link?.sessionKey ?? "").trim();
			const sessionKey = sessionKeyRaw.length > 0 ? sessionKeyRaw : `node-${nodeId}`;
			const { storePath, entry, canonicalKey } = loadSessionEntry(sessionKey);
			const now = Date.now();
			const sessionId = entry?.sessionId ?? randomUUID();
			if (storePath) await updateSessionStore(storePath, (store) => {
				store[canonicalKey] = {
					sessionId,
					updatedAt: now,
					thinkingLevel: entry?.thinkingLevel,
					verboseLevel: entry?.verboseLevel,
					reasoningLevel: entry?.reasoningLevel,
					systemSent: entry?.systemSent,
					sendPolicy: entry?.sendPolicy,
					lastChannel: entry?.lastChannel,
					lastTo: entry?.lastTo
				};
			});
			agentCommand({
				message,
				sessionId,
				sessionKey,
				thinking: link?.thinking ?? void 0,
				deliver,
				to,
				channel,
				timeout: typeof link?.timeoutSeconds === "number" ? link.timeoutSeconds.toString() : void 0,
				messageChannel: "node"
			}, defaultRuntime, ctx.deps).catch((err) => {
				ctx.logGateway.warn(`agent failed node=${nodeId}: ${formatForLog(err)}`);
			});
			return;
		}
		case "chat.subscribe": {
			if (!evt.payloadJSON) return;
			let payload;
			try {
				payload = JSON.parse(evt.payloadJSON);
			} catch {
				return;
			}
			const obj = typeof payload === "object" && payload !== null ? payload : {};
			const sessionKey = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : "";
			if (!sessionKey) return;
			ctx.nodeSubscribe(nodeId, sessionKey);
			return;
		}
		case "chat.unsubscribe": {
			if (!evt.payloadJSON) return;
			let payload;
			try {
				payload = JSON.parse(evt.payloadJSON);
			} catch {
				return;
			}
			const obj = typeof payload === "object" && payload !== null ? payload : {};
			const sessionKey = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : "";
			if (!sessionKey) return;
			ctx.nodeUnsubscribe(nodeId, sessionKey);
			return;
		}
		case "exec.started":
		case "exec.finished":
		case "exec.denied": {
			if (!evt.payloadJSON) return;
			let payload;
			try {
				payload = JSON.parse(evt.payloadJSON);
			} catch {
				return;
			}
			const obj = typeof payload === "object" && payload !== null ? payload : {};
			const sessionKey = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : `node-${nodeId}`;
			if (!sessionKey) return;
			const runId = typeof obj.runId === "string" ? obj.runId.trim() : "";
			const command = typeof obj.command === "string" ? obj.command.trim() : "";
			const exitCode = typeof obj.exitCode === "number" && Number.isFinite(obj.exitCode) ? obj.exitCode : void 0;
			const timedOut = obj.timedOut === true;
			const output = typeof obj.output === "string" ? obj.output.trim() : "";
			const reason = typeof obj.reason === "string" ? obj.reason.trim() : "";
			let text = "";
			if (evt.event === "exec.started") {
				text = `Exec started (node=${nodeId}${runId ? ` id=${runId}` : ""})`;
				if (command) text += `: ${command}`;
			} else if (evt.event === "exec.finished") {
				const exitLabel = timedOut ? "timeout" : `code ${exitCode ?? "?"}`;
				text = `Exec finished (node=${nodeId}${runId ? ` id=${runId}` : ""}, ${exitLabel})`;
				if (output) text += `\n${output}`;
			} else {
				text = `Exec denied (node=${nodeId}${runId ? ` id=${runId}` : ""}${reason ? `, ${reason}` : ""})`;
				if (command) text += `: ${command}`;
			}
			enqueueSystemEvent(text, {
				sessionKey,
				contextKey: runId ? `exec:${runId}` : "exec"
			});
			requestHeartbeatNow({ reason: "exec-event" });
			return;
		}
		default: return;
	}
};

//#endregion
export { handleNodeEvent };