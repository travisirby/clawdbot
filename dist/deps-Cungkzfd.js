import { An as sendMessageWhatsApp, Mn as sendMessageSlack, dt as sendMessageIMessage, mn as sendMessageDiscord, pn as sendMessageTelegram } from "./reply-D5DQmXpo.js";
import { b as sendMessageSignal } from "./deliver-DsD2VjZR.js";

//#region src/cli/deps.ts
function createDefaultDeps() {
	return {
		sendMessageWhatsApp,
		sendMessageTelegram,
		sendMessageDiscord,
		sendMessageSlack,
		sendMessageSignal,
		sendMessageIMessage
	};
}
function createOutboundSendDeps(deps) {
	return {
		sendWhatsApp: deps.sendMessageWhatsApp,
		sendTelegram: deps.sendMessageTelegram,
		sendDiscord: deps.sendMessageDiscord,
		sendSlack: deps.sendMessageSlack,
		sendSignal: deps.sendMessageSignal,
		sendIMessage: deps.sendMessageIMessage
	};
}

//#endregion
export { createOutboundSendDeps as n, createDefaultDeps as t };