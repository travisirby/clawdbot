import type { WebClient as SlackWebClient } from "@slack/web-api";

import type { FetchLike } from "../../media/fetch.js";
import { fetchRemoteMedia } from "../../media/fetch.js";
import { saveMediaBuffer } from "../../media/store.js";
import type { SlackFile } from "../types.js";

/**
 * Fetches a URL with Authorization header, handling cross-origin redirects.
 * Node.js fetch strips Authorization headers on cross-origin redirects for security.
 * Slack's files.slack.com URLs redirect to CDN domains with pre-signed URLs that
 * don't need the Authorization header, so we handle the initial auth request manually.
 */
export async function fetchWithSlackAuth(url: string, token: string): Promise<Response> {
  // Initial request with auth and manual redirect handling
  const initialRes = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    redirect: "manual",
  });

  // If not a redirect, return the response directly
  if (initialRes.status < 300 || initialRes.status >= 400) {
    return initialRes;
  }

  // Handle redirect - the redirected URL should be pre-signed and not need auth
  const redirectUrl = initialRes.headers.get("location");
  if (!redirectUrl) {
    return initialRes;
  }

  // Resolve relative URLs against the original
  const resolvedUrl = new URL(redirectUrl, url).toString();

  // Follow the redirect without the Authorization header
  // (Slack's CDN URLs are pre-signed and don't need it)
  return fetch(resolvedUrl, { redirect: "follow" });
}

export async function resolveSlackMedia(params: {
  files?: SlackFile[];
  token: string;
  maxBytes: number;
}): Promise<{
  path: string;
  contentType?: string;
  placeholder: string;
} | null> {
  const files = params.files ?? [];
  for (const file of files) {
    const url = file.url_private_download ?? file.url_private;
    if (!url) continue;
    try {
      // Note: We ignore init options because fetchWithSlackAuth handles
      // redirect behavior specially. fetchRemoteMedia only passes the URL.
      const fetchImpl: FetchLike = (input) => {
        const inputUrl =
          typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        return fetchWithSlackAuth(inputUrl, params.token);
      };
      const fetched = await fetchRemoteMedia({
        url,
        fetchImpl,
        filePathHint: file.name,
      });
      if (fetched.buffer.byteLength > params.maxBytes) continue;
      const saved = await saveMediaBuffer(
        fetched.buffer,
        fetched.contentType ?? file.mimetype,
        "inbound",
        params.maxBytes,
      );
      const label = fetched.fileName ?? file.name;
      return {
        path: saved.path,
        contentType: saved.contentType,
        placeholder: label ? `[Slack file: ${label}]` : "[Slack file]",
      };
    } catch {
      // Ignore download failures and fall through to the next file.
    }
  }
  return null;
}

export type SlackThreadStarter = {
  text: string;
  userId?: string;
  ts?: string;
  files?: SlackFile[];
};

const THREAD_STARTER_CACHE = new Map<string, SlackThreadStarter>();

export async function resolveSlackThreadStarter(params: {
  channelId: string;
  threadTs: string;
  client: SlackWebClient;
}): Promise<SlackThreadStarter | null> {
  const cacheKey = `${params.channelId}:${params.threadTs}`;
  const cached = THREAD_STARTER_CACHE.get(cacheKey);
  if (cached) return cached;
  try {
    const response = (await params.client.conversations.replies({
      channel: params.channelId,
      ts: params.threadTs,
      limit: 1,
      inclusive: true,
    })) as { messages?: Array<{ text?: string; user?: string; ts?: string; files?: SlackFile[] }> };
    const message = response?.messages?.[0];
    const text = (message?.text ?? "").trim();
    if (!message || !text) return null;
    const starter: SlackThreadStarter = {
      text,
      userId: message.user,
      ts: message.ts,
      files: message.files,
    };
    THREAD_STARTER_CACHE.set(cacheKey, starter);
    return starter;
  } catch {
    return null;
  }
}

export type SlackThreadReply = {
  text: string;
  userId?: string;
  ts?: string;
  botId?: string;
};

const THREAD_HISTORY_CACHE = new Map<string, SlackThreadReply[]>();
const MAX_THREAD_HISTORY_CACHE = 500;

/**
 * Fetches intermediate thread replies from the Slack API (excluding root and current message).
 * Results are cached per thread to avoid redundant API calls.
 */
export async function resolveSlackThreadHistory(params: {
  channelId: string;
  threadTs: string;
  client: SlackWebClient;
  limit?: number;
  currentTs?: string;
}): Promise<SlackThreadReply[]> {
  const cacheKey = `${params.channelId}:${params.threadTs}`;
  const cached = THREAD_HISTORY_CACHE.get(cacheKey);
  if (cached) return cached;
  try {
    const response = (await params.client.conversations.replies({
      channel: params.channelId,
      ts: params.threadTs,
      limit: params.limit ?? 50,
      inclusive: true,
    })) as {
      messages?: Array<{
        text?: string;
        user?: string;
        ts?: string;
        bot_id?: string;
      }>;
    };
    const messages = response?.messages ?? [];
    // Filter out the root message and the current message
    const replies: SlackThreadReply[] = messages
      .filter((m) => m.ts !== params.threadTs && m.ts !== params.currentTs)
      .map((m) => ({
        text: (m.text ?? "").trim(),
        userId: m.user,
        ts: m.ts,
        botId: m.bot_id,
      }))
      .filter((r) => r.text.length > 0);

    // Evict oldest entries when cache exceeds limit
    if (THREAD_HISTORY_CACHE.size >= MAX_THREAD_HISTORY_CACHE) {
      const keysToDelete = THREAD_HISTORY_CACHE.size - MAX_THREAD_HISTORY_CACHE + 1;
      const iterator = THREAD_HISTORY_CACHE.keys();
      for (let i = 0; i < keysToDelete; i++) {
        const key = iterator.next().value;
        if (key !== undefined) THREAD_HISTORY_CACHE.delete(key);
      }
    }

    THREAD_HISTORY_CACHE.set(cacheKey, replies);
    return replies;
  } catch {
    return [];
  }
}

/** @internal Test-only: reset the thread history cache. */
export function __resetSlackThreadHistoryCacheForTest(): void {
  THREAD_HISTORY_CACHE.clear();
}

/** @internal Test-only: reset the thread starter cache. */
export function __resetSlackThreadStarterCacheForTest(): void {
  THREAD_STARTER_CACHE.clear();
}
