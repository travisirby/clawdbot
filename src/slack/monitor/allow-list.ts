import type { AllowlistMatch } from "../../channels/allowlist-match.js";

export function normalizeSlackSlug(raw?: string) {
  const trimmed = raw?.trim().toLowerCase() ?? "";
  if (!trimmed) return "";
  const dashed = trimmed.replace(/\s+/g, "-");
  const cleaned = dashed.replace(/[^a-z0-9#@._+-]+/g, "-");
  return cleaned.replace(/-{2,}/g, "-").replace(/^[-.]+|[-.]+$/g, "");
}

export function normalizeAllowList(list?: Array<string | number>) {
  return (list ?? []).map((entry) => String(entry).trim()).filter(Boolean);
}

export function normalizeAllowListLower(list?: Array<string | number>) {
  return normalizeAllowList(list).map((entry) => entry.toLowerCase());
}

export type SlackAllowListMatch = AllowlistMatch<
  "wildcard" | "id" | "prefixed-id" | "prefixed-user" | "name" | "prefixed-name" | "slug"
>;

export function resolveSlackAllowListMatch(params: {
  allowList: string[];
  id?: string;
  name?: string;
}): SlackAllowListMatch {
  const allowList = params.allowList;
  if (allowList.length === 0) return { allowed: false };
  if (allowList.includes("*")) {
    return { allowed: true, matchKey: "*", matchSource: "wildcard" };
  }
  const id = params.id?.toLowerCase();
  const name = params.name?.toLowerCase();
  const slug = normalizeSlackSlug(name);
  const candidates: Array<{ value?: string; source: SlackAllowListMatch["matchSource"] }> = [
    { value: id, source: "id" },
    { value: id ? `slack:${id}` : undefined, source: "prefixed-id" },
    { value: id ? `user:${id}` : undefined, source: "prefixed-user" },
    { value: name, source: "name" },
    { value: name ? `slack:${name}` : undefined, source: "prefixed-name" },
    { value: slug, source: "slug" },
  ];
  for (const candidate of candidates) {
    if (!candidate.value) continue;
    if (allowList.includes(candidate.value)) {
      return {
        allowed: true,
        matchKey: candidate.value,
        matchSource: candidate.source,
      };
    }
  }
  return { allowed: false };
}

export function allowListMatches(params: { allowList: string[]; id?: string; name?: string }) {
  return resolveSlackAllowListMatch(params).allowed;
}

export function resolveSlackUserAllowed(params: {
  allowList?: Array<string | number>;
  userId?: string;
  userName?: string;
}) {
  const allowList = normalizeAllowListLower(params.allowList);
  if (allowList.length === 0) return true;
  return allowListMatches({
    allowList,
    id: params.userId,
    name: params.userName,
  });
}

export function shouldNotifySlackReaction(params: {
  mode: "off" | "own" | "all" | "allowlist";
  botUserId?: string;
  messageAuthorId?: string;
  reactorId?: string;
  reactorName?: string;
  allowlist?: Array<string | number>;
}): boolean {
  const { mode, botUserId, messageAuthorId, reactorId, reactorName, allowlist } = params;
  if (mode === "off") return false;
  if (mode === "all") return true;
  if (mode === "own") {
    // Only notify if the reaction is on a message authored by the bot
    return Boolean(botUserId && messageAuthorId && messageAuthorId === botUserId);
  }
  if (mode === "allowlist") {
    // Only notify if the reactor is in the allowlist (empty list = no one)
    const normalizedList = normalizeAllowListLower(allowlist);
    if (normalizedList.length === 0) return false;
    return allowListMatches({
      allowList: normalizedList,
      id: reactorId,
      name: reactorName,
    });
  }
  return false;
}
