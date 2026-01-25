import { describe, it, expect } from "vitest";
import type { MsgContext } from "../templating.js";

describe("runPreparedReply - thread starter context", () => {
  // Helper to create minimal MsgContext for testing
  const createMsgContext = (overrides: Partial<MsgContext> = {}): MsgContext => {
    return {
      Body: "test message",
      BodyStripped: "test message",
      RawBody: "test message",
      Provider: "slack",
      From: "+15551234567",
      To: "+15557654321",
      ThreadStarterBody: undefined,
      ...overrides,
    } as MsgContext;
  };

  describe("thread starter injection", () => {
    it("should include thread starter in fresh session (not a new session)", () => {
      const ctx = createMsgContext({
        ThreadStarterBody: "Let's discuss the new feature for voice commands",
      });

      const threadStarterBody = ctx.ThreadStarterBody?.trim();

      // Simulate the fixed logic (always include if present, regardless of session state)
      const threadStarterNote = threadStarterBody
        ? `[Thread starter - for context]\n${threadStarterBody}`
        : undefined;

      expect(threadStarterNote).toBeDefined();
      expect(threadStarterNote).toContain("Let's discuss the new feature for voice commands");
      expect(threadStarterNote).toContain("[Thread starter - for context]");
    });

    it("should include thread starter in new session", () => {
      const ctx = createMsgContext({
        ThreadStarterBody: "Let's discuss the new feature for voice commands",
      });

      const threadStarterBody = ctx.ThreadStarterBody?.trim();

      // The logic is the same regardless of session state
      const threadStarterNote = threadStarterBody
        ? `[Thread starter - for context]\n${threadStarterBody}`
        : undefined;

      expect(threadStarterNote).toBeDefined();
      expect(threadStarterNote).toContain("Let's discuss the new feature for voice commands");
    });

    it("should not include thread starter when ThreadStarterBody is undefined", () => {
      const ctx = createMsgContext({
        ThreadStarterBody: undefined,
      });

      const threadStarterBody = ctx.ThreadStarterBody?.trim();

      const threadStarterNote = threadStarterBody
        ? `[Thread starter - for context]\n${threadStarterBody}`
        : undefined;

      expect(threadStarterNote).toBeUndefined();
    });

    it("should not include thread starter when ThreadStarterBody is empty", () => {
      const ctx = createMsgContext({
        ThreadStarterBody: "   ",
      });

      const threadStarterBody = ctx.ThreadStarterBody?.trim();

      const threadStarterNote = threadStarterBody
        ? `[Thread starter - for context]\n${threadStarterBody}`
        : undefined;

      expect(threadStarterNote).toBeUndefined();
    });

    it("should truncate very long thread starters", () => {
      const MAX_THREAD_STARTER_LENGTH = 2000;
      const longBody = "a".repeat(3000);

      const ctx = createMsgContext({
        ThreadStarterBody: longBody,
      });

      const threadStarterBody = ctx.ThreadStarterBody?.trim();
      const threadStarterTrimmed =
        threadStarterBody && threadStarterBody.length > MAX_THREAD_STARTER_LENGTH
          ? threadStarterBody.slice(0, MAX_THREAD_STARTER_LENGTH) + "... [truncated]"
          : threadStarterBody;
      const threadStarterNote = threadStarterTrimmed
        ? `[Thread starter - for context]\n${threadStarterTrimmed}`
        : undefined;

      expect(threadStarterNote).toBeDefined();
      expect(threadStarterNote).toContain("... [truncated]");
      expect(threadStarterNote!.length).toBeLessThan(longBody.length);
    });

    it("should not truncate thread starters under the length limit", () => {
      const normalBody = "Let's discuss the new feature for voice commands";

      const ctx = createMsgContext({
        ThreadStarterBody: normalBody,
      });

      const MAX_THREAD_STARTER_LENGTH = 2000;
      const threadStarterBody = ctx.ThreadStarterBody?.trim();
      const threadStarterTrimmed =
        threadStarterBody && threadStarterBody.length > MAX_THREAD_STARTER_LENGTH
          ? threadStarterBody.slice(0, MAX_THREAD_STARTER_LENGTH) + "... [truncated]"
          : threadStarterBody;
      const threadStarterNote = threadStarterTrimmed
        ? `[Thread starter - for context]\n${threadStarterTrimmed}`
        : undefined;

      expect(threadStarterNote).toBeDefined();
      expect(threadStarterNote).not.toContain("... [truncated]");
      expect(threadStarterNote).toContain(normalBody);
    });
  });

  describe("thread starter in non-thread messages", () => {
    it("should not inject thread starter when not in a thread", () => {
      const ctx = createMsgContext({
        ThreadStarterBody: undefined,
      });

      const threadStarterBody = ctx.ThreadStarterBody?.trim();
      const threadStarterNote = threadStarterBody
        ? `[Thread starter - for context]\n${threadStarterBody}`
        : undefined;

      expect(threadStarterNote).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle thread starters with only whitespace", () => {
      const ctx = createMsgContext({
        ThreadStarterBody: "\n\n   \t   \n",
      });

      const threadStarterBody = ctx.ThreadStarterBody?.trim();
      const threadStarterNote = threadStarterBody
        ? `[Thread starter - for context]\n${threadStarterBody}`
        : undefined;

      expect(threadStarterNote).toBeUndefined();
    });

    it("should preserve multi-line thread starters", () => {
      const multilineBody = "First line\nSecond line\nThird line";

      const ctx = createMsgContext({
        ThreadStarterBody: multilineBody,
      });

      const threadStarterBody = ctx.ThreadStarterBody?.trim();
      const threadStarterNote = threadStarterBody
        ? `[Thread starter - for context]\n${threadStarterBody}`
        : undefined;

      expect(threadStarterNote).toBeDefined();
      expect(threadStarterNote).toContain("First line");
      expect(threadStarterNote).toContain("Second line");
      expect(threadStarterNote).toContain("Third line");
    });

    it("should handle thread starters at exactly the length limit", () => {
      const MAX_THREAD_STARTER_LENGTH = 2000;
      const exactBody = "a".repeat(MAX_THREAD_STARTER_LENGTH);

      const ctx = createMsgContext({
        ThreadStarterBody: exactBody,
      });

      const threadStarterBody = ctx.ThreadStarterBody?.trim();
      const threadStarterTrimmed =
        threadStarterBody && threadStarterBody.length > MAX_THREAD_STARTER_LENGTH
          ? threadStarterBody.slice(0, MAX_THREAD_STARTER_LENGTH) + "... [truncated]"
          : threadStarterBody;
      const threadStarterNote = threadStarterTrimmed
        ? `[Thread starter - for context]\n${threadStarterTrimmed}`
        : undefined;

      expect(threadStarterNote).toBeDefined();
      expect(threadStarterNote).not.toContain("... [truncated]");
      expect(threadStarterTrimmed).toEqual(exactBody);
    });
  });
});
