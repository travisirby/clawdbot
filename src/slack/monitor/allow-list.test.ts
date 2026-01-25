import { describe, expect, it } from "vitest";

import {
  allowListMatches,
  normalizeAllowList,
  normalizeAllowListLower,
  normalizeSlackSlug,
  resolveSlackAllowListMatch,
  resolveSlackUserAllowed,
  shouldNotifySlackReaction,
} from "./allow-list.js";

describe("normalizeSlackSlug", () => {
  it("normalizes slugs to lowercase dashed form", () => {
    expect(normalizeSlackSlug("My Channel")).toBe("my-channel");
    // Note: normalizeSlackSlug preserves # as it's in the allowed character set
    expect(normalizeSlackSlug("#My-Channel")).toBe("#my-channel");
    expect(normalizeSlackSlug("  spaced  out  ")).toBe("spaced-out");
  });

  it("handles empty input", () => {
    expect(normalizeSlackSlug("")).toBe("");
    expect(normalizeSlackSlug(undefined)).toBe("");
  });
});

describe("normalizeAllowList", () => {
  it("filters empty entries", () => {
    expect(normalizeAllowList(["a", "", "b", "  "])).toEqual(["a", "b"]);
  });

  it("handles undefined", () => {
    expect(normalizeAllowList(undefined)).toEqual([]);
  });
});

describe("normalizeAllowListLower", () => {
  it("lowercases entries", () => {
    expect(normalizeAllowListLower(["FOO", "Bar"])).toEqual(["foo", "bar"]);
  });
});

describe("resolveSlackAllowListMatch", () => {
  it("matches wildcard", () => {
    const result = resolveSlackAllowListMatch({ allowList: ["*"], id: "123" });
    expect(result).toEqual({ allowed: true, matchKey: "*", matchSource: "wildcard" });
  });

  it("matches by id", () => {
    const result = resolveSlackAllowListMatch({ allowList: ["123", "456"], id: "123" });
    expect(result).toEqual({ allowed: true, matchKey: "123", matchSource: "id" });
  });

  it("matches by prefixed id", () => {
    const result = resolveSlackAllowListMatch({ allowList: ["slack:123"], id: "123" });
    expect(result).toEqual({ allowed: true, matchKey: "slack:123", matchSource: "prefixed-id" });
  });

  it("matches by name", () => {
    const result = resolveSlackAllowListMatch({ allowList: ["alice"], name: "alice" });
    expect(result).toEqual({ allowed: true, matchKey: "alice", matchSource: "name" });
  });

  it("returns not allowed when no match", () => {
    const result = resolveSlackAllowListMatch({ allowList: ["foo"], id: "bar" });
    expect(result).toEqual({ allowed: false });
  });

  it("returns not allowed for empty list", () => {
    const result = resolveSlackAllowListMatch({ allowList: [], id: "123" });
    expect(result).toEqual({ allowed: false });
  });
});

describe("allowListMatches", () => {
  it("delegates to resolveSlackAllowListMatch", () => {
    expect(allowListMatches({ allowList: ["123"], id: "123" })).toBe(true);
    expect(allowListMatches({ allowList: ["456"], id: "123" })).toBe(false);
  });
});

describe("resolveSlackUserAllowed", () => {
  it("allows all when list is empty", () => {
    expect(resolveSlackUserAllowed({ userId: "123" })).toBe(true);
    expect(resolveSlackUserAllowed({ allowList: [], userId: "123" })).toBe(true);
  });

  it("matches by id", () => {
    expect(resolveSlackUserAllowed({ allowList: ["123"], userId: "123" })).toBe(true);
    expect(resolveSlackUserAllowed({ allowList: ["456"], userId: "123" })).toBe(false);
  });
});

describe("shouldNotifySlackReaction", () => {
  it("defaults to own when mode is own and message is from bot", () => {
    expect(
      shouldNotifySlackReaction({
        mode: "own",
        botUserId: "bot-1",
        messageAuthorId: "bot-1",
        reactorId: "user-1",
      }),
    ).toBe(true);
  });

  it("rejects when mode is own and message is not from bot", () => {
    expect(
      shouldNotifySlackReaction({
        mode: "own",
        botUserId: "bot-1",
        messageAuthorId: "user-1",
        reactorId: "user-2",
      }),
    ).toBe(false);
  });

  it("skips when mode is off", () => {
    expect(
      shouldNotifySlackReaction({
        mode: "off",
        botUserId: "bot-1",
        messageAuthorId: "bot-1",
        reactorId: "user-1",
      }),
    ).toBe(false);
  });

  it("allows all reactions when mode is all", () => {
    expect(
      shouldNotifySlackReaction({
        mode: "all",
        botUserId: "bot-1",
        messageAuthorId: "user-1",
        reactorId: "user-2",
      }),
    ).toBe(true);
  });

  it("requires bot ownership when mode is own", () => {
    expect(
      shouldNotifySlackReaction({
        mode: "own",
        botUserId: "bot-1",
        messageAuthorId: "bot-1",
        reactorId: "user-2",
      }),
    ).toBe(true);
    expect(
      shouldNotifySlackReaction({
        mode: "own",
        botUserId: "bot-1",
        messageAuthorId: "user-2",
        reactorId: "user-3",
      }),
    ).toBe(false);
  });

  it("requires allowlist matches when mode is allowlist", () => {
    expect(
      shouldNotifySlackReaction({
        mode: "allowlist",
        botUserId: "bot-1",
        messageAuthorId: "user-1",
        reactorId: "user-2",
        allowlist: [],
      }),
    ).toBe(false);
    expect(
      shouldNotifySlackReaction({
        mode: "allowlist",
        botUserId: "bot-1",
        messageAuthorId: "user-1",
        reactorId: "U123",
        reactorName: "travis",
        allowlist: ["U123", "other"],
      }),
    ).toBe(true);
  });

  it("handles missing botUserId in own mode", () => {
    expect(
      shouldNotifySlackReaction({
        mode: "own",
        botUserId: undefined,
        messageAuthorId: "user-1",
        reactorId: "user-2",
      }),
    ).toBe(false);
  });

  it("handles missing messageAuthorId in own mode", () => {
    expect(
      shouldNotifySlackReaction({
        mode: "own",
        botUserId: "bot-1",
        messageAuthorId: undefined,
        reactorId: "user-2",
      }),
    ).toBe(false);
  });
});
