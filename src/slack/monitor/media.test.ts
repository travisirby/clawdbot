import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Store original fetch
const originalFetch = globalThis.fetch;
let mockFetch: ReturnType<typeof vi.fn>;

describe("fetchWithSlackAuth", () => {
  beforeEach(() => {
    // Create a new mock for each test
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as typeof fetch;
  });

  afterEach(() => {
    // Restore original fetch
    globalThis.fetch = originalFetch;
    vi.resetModules();
  });

  it("sends Authorization header on initial request with manual redirect", async () => {
    // Import after mocking fetch
    const { fetchWithSlackAuth } = await import("./media.js");

    // Simulate direct 200 response (no redirect)
    const mockResponse = new Response(Buffer.from("image data"), {
      status: 200,
      headers: { "content-type": "image/jpeg" },
    });
    mockFetch.mockResolvedValueOnce(mockResponse);

    const result = await fetchWithSlackAuth("https://files.slack.com/test.jpg", "xoxb-test-token");

    expect(result).toBe(mockResponse);

    // Verify fetch was called with correct params
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith("https://files.slack.com/test.jpg", {
      headers: { Authorization: "Bearer xoxb-test-token" },
      redirect: "manual",
    });
  });

  it("follows redirects without Authorization header", async () => {
    const { fetchWithSlackAuth } = await import("./media.js");

    // First call: redirect response from Slack
    const redirectResponse = new Response(null, {
      status: 302,
      headers: { location: "https://cdn.slack-edge.com/presigned-url?sig=abc123" },
    });

    // Second call: actual file content from CDN
    const fileResponse = new Response(Buffer.from("actual image data"), {
      status: 200,
      headers: { "content-type": "image/jpeg" },
    });

    mockFetch.mockResolvedValueOnce(redirectResponse).mockResolvedValueOnce(fileResponse);

    const result = await fetchWithSlackAuth("https://files.slack.com/test.jpg", "xoxb-test-token");

    expect(result).toBe(fileResponse);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // First call should have Authorization header and manual redirect
    expect(mockFetch).toHaveBeenNthCalledWith(1, "https://files.slack.com/test.jpg", {
      headers: { Authorization: "Bearer xoxb-test-token" },
      redirect: "manual",
    });

    // Second call should follow the redirect without Authorization
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://cdn.slack-edge.com/presigned-url?sig=abc123",
      { redirect: "follow" },
    );
  });

  it("handles relative redirect URLs", async () => {
    const { fetchWithSlackAuth } = await import("./media.js");

    // Redirect with relative URL
    const redirectResponse = new Response(null, {
      status: 302,
      headers: { location: "/files/redirect-target" },
    });

    const fileResponse = new Response(Buffer.from("image data"), {
      status: 200,
      headers: { "content-type": "image/jpeg" },
    });

    mockFetch.mockResolvedValueOnce(redirectResponse).mockResolvedValueOnce(fileResponse);

    await fetchWithSlackAuth("https://files.slack.com/original.jpg", "xoxb-test-token");

    // Second call should resolve the relative URL against the original
    expect(mockFetch).toHaveBeenNthCalledWith(2, "https://files.slack.com/files/redirect-target", {
      redirect: "follow",
    });
  });

  it("returns redirect response when no location header is provided", async () => {
    const { fetchWithSlackAuth } = await import("./media.js");

    // Redirect without location header
    const redirectResponse = new Response(null, {
      status: 302,
      // No location header
    });

    mockFetch.mockResolvedValueOnce(redirectResponse);

    const result = await fetchWithSlackAuth("https://files.slack.com/test.jpg", "xoxb-test-token");

    // Should return the redirect response directly
    expect(result).toBe(redirectResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("returns 4xx/5xx responses directly without following", async () => {
    const { fetchWithSlackAuth } = await import("./media.js");

    const errorResponse = new Response("Not Found", {
      status: 404,
    });

    mockFetch.mockResolvedValueOnce(errorResponse);

    const result = await fetchWithSlackAuth("https://files.slack.com/test.jpg", "xoxb-test-token");

    expect(result).toBe(errorResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("handles 301 permanent redirects", async () => {
    const { fetchWithSlackAuth } = await import("./media.js");

    const redirectResponse = new Response(null, {
      status: 301,
      headers: { location: "https://cdn.slack.com/new-url" },
    });

    const fileResponse = new Response(Buffer.from("image data"), {
      status: 200,
    });

    mockFetch.mockResolvedValueOnce(redirectResponse).mockResolvedValueOnce(fileResponse);

    await fetchWithSlackAuth("https://files.slack.com/test.jpg", "xoxb-test-token");

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(2, "https://cdn.slack.com/new-url", {
      redirect: "follow",
    });
  });
});

describe("resolveSlackMedia", () => {
  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.resetModules();
  });

  it("prefers url_private_download over url_private", async () => {
    // Mock the store module
    vi.doMock("../../media/store.js", () => ({
      saveMediaBuffer: vi.fn().mockResolvedValue({
        path: "/tmp/test.jpg",
        contentType: "image/jpeg",
      }),
    }));

    const { resolveSlackMedia } = await import("./media.js");

    const mockResponse = new Response(Buffer.from("image data"), {
      status: 200,
      headers: { "content-type": "image/jpeg" },
    });
    mockFetch.mockResolvedValueOnce(mockResponse);

    await resolveSlackMedia({
      files: [
        {
          url_private: "https://files.slack.com/private.jpg",
          url_private_download: "https://files.slack.com/download.jpg",
          name: "test.jpg",
        },
      ],
      token: "xoxb-test-token",
      maxBytes: 1024 * 1024,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://files.slack.com/download.jpg",
      expect.anything(),
    );
  });

  it("returns null when download fails", async () => {
    const { resolveSlackMedia } = await import("./media.js");

    // Simulate a network error
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await resolveSlackMedia({
      files: [{ url_private: "https://files.slack.com/test.jpg", name: "test.jpg" }],
      token: "xoxb-test-token",
      maxBytes: 1024 * 1024,
    });

    expect(result).toBeNull();
  });

  it("returns null when no files are provided", async () => {
    const { resolveSlackMedia } = await import("./media.js");

    const result = await resolveSlackMedia({
      files: [],
      token: "xoxb-test-token",
      maxBytes: 1024 * 1024,
    });

    expect(result).toBeNull();
  });

  it("skips files without url_private", async () => {
    const { resolveSlackMedia } = await import("./media.js");

    const result = await resolveSlackMedia({
      files: [{ name: "test.jpg" }], // No url_private
      token: "xoxb-test-token",
      maxBytes: 1024 * 1024,
    });

    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("falls through to next file when first file returns error", async () => {
    // Mock the store module
    vi.doMock("../../media/store.js", () => ({
      saveMediaBuffer: vi.fn().mockResolvedValue({
        path: "/tmp/test.jpg",
        contentType: "image/jpeg",
      }),
    }));

    const { resolveSlackMedia } = await import("./media.js");

    // First file: 404
    const errorResponse = new Response("Not Found", { status: 404 });
    // Second file: success
    const successResponse = new Response(Buffer.from("image data"), {
      status: 200,
      headers: { "content-type": "image/jpeg" },
    });

    mockFetch.mockResolvedValueOnce(errorResponse).mockResolvedValueOnce(successResponse);

    const result = await resolveSlackMedia({
      files: [
        { url_private: "https://files.slack.com/first.jpg", name: "first.jpg" },
        { url_private: "https://files.slack.com/second.jpg", name: "second.jpg" },
      ],
      token: "xoxb-test-token",
      maxBytes: 1024 * 1024,
    });

    expect(result).not.toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe("resolveSlackThreadHistory", () => {
  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as typeof fetch;
  });

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    vi.resetModules();
  });

  function makeClient(
    messages: Array<{ text?: string; user?: string; ts?: string; bot_id?: string }>,
  ) {
    return {
      conversations: {
        replies: vi.fn().mockResolvedValue({ messages }),
      },
    } as unknown as import("@slack/web-api").WebClient;
  }

  it("fetches and caches thread replies, excluding the root message", async () => {
    const { resolveSlackThreadHistory, __resetSlackThreadHistoryCacheForTest } =
      await import("./media.js");
    __resetSlackThreadHistoryCacheForTest();

    const client = makeClient([
      { text: "root message", user: "U1", ts: "1000.0" },
      { text: "reply one", user: "U2", ts: "1001.0" },
      { text: "reply two", user: "U3", ts: "1002.0" },
    ]);

    const result = await resolveSlackThreadHistory({
      channelId: "C123",
      threadTs: "1000.0",
      client,
    });

    expect(result).toHaveLength(2);
    expect(result[0].text).toBe("reply one");
    expect(result[0].userId).toBe("U2");
    expect(result[1].text).toBe("reply two");
    expect(result[1].userId).toBe("U3");

    // Second call should be cached (single API call total)
    const result2 = await resolveSlackThreadHistory({
      channelId: "C123",
      threadTs: "1000.0",
      client,
    });
    expect(result2).toEqual(result);
    expect(client.conversations.replies).toHaveBeenCalledTimes(1);
  });

  it("excludes the current message from results", async () => {
    const { resolveSlackThreadHistory, __resetSlackThreadHistoryCacheForTest } =
      await import("./media.js");
    __resetSlackThreadHistoryCacheForTest();

    const client = makeClient([
      { text: "root", user: "U1", ts: "1000.0" },
      { text: "intermediate", user: "U2", ts: "1001.0" },
      { text: "current", user: "U3", ts: "1002.0" },
    ]);

    const result = await resolveSlackThreadHistory({
      channelId: "C456",
      threadTs: "1000.0",
      client,
      currentTs: "1002.0",
    });

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("intermediate");
  });

  it("returns empty array on API error", async () => {
    const { resolveSlackThreadHistory, __resetSlackThreadHistoryCacheForTest } =
      await import("./media.js");
    __resetSlackThreadHistoryCacheForTest();

    const client = {
      conversations: {
        replies: vi.fn().mockRejectedValue(new Error("rate limited")),
      },
    } as unknown as import("@slack/web-api").WebClient;

    const result = await resolveSlackThreadHistory({
      channelId: "C789",
      threadTs: "1000.0",
      client,
    });

    expect(result).toEqual([]);
  });

  it("filters out replies with empty text", async () => {
    const { resolveSlackThreadHistory, __resetSlackThreadHistoryCacheForTest } =
      await import("./media.js");
    __resetSlackThreadHistoryCacheForTest();

    const client = makeClient([
      { text: "root", user: "U1", ts: "1000.0" },
      { text: "", user: "U2", ts: "1001.0" },
      { text: "valid reply", user: "U3", ts: "1002.0" },
    ]);

    const result = await resolveSlackThreadHistory({
      channelId: "Cempty",
      threadTs: "1000.0",
      client,
    });

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("valid reply");
  });

  it("evicts oldest cache entries when exceeding 500", async () => {
    const { resolveSlackThreadHistory, __resetSlackThreadHistoryCacheForTest } =
      await import("./media.js");
    __resetSlackThreadHistoryCacheForTest();

    // Fill cache to 500
    for (let i = 0; i < 500; i++) {
      const client = makeClient([
        { text: "root", user: "U1", ts: `${i}.0` },
        { text: `reply-${i}`, user: "U2", ts: `${i}.1` },
      ]);
      await resolveSlackThreadHistory({
        channelId: `C-evict-${i}`,
        threadTs: `${i}.0`,
        client,
      });
    }

    // Add one more — should evict the first entry
    const client = makeClient([
      { text: "root", user: "U1", ts: "new.0" },
      { text: "new-reply", user: "U2", ts: "new.1" },
    ]);
    await resolveSlackThreadHistory({
      channelId: "C-evict-new",
      threadTs: "new.0",
      client,
    });

    // The new entry should be cached (no new API call)
    const clientCheck = makeClient([]);
    const result = await resolveSlackThreadHistory({
      channelId: "C-evict-new",
      threadTs: "new.0",
      client: clientCheck,
    });
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("new-reply");
    expect(clientCheck.conversations.replies).not.toHaveBeenCalled();
  });

  it("preserves botId in replies", async () => {
    const { resolveSlackThreadHistory, __resetSlackThreadHistoryCacheForTest } =
      await import("./media.js");
    __resetSlackThreadHistoryCacheForTest();

    const client = makeClient([
      { text: "root", user: "U1", ts: "1000.0" },
      { text: "bot reply", user: "UBOT", ts: "1001.0", bot_id: "B123" },
    ]);

    const result = await resolveSlackThreadHistory({
      channelId: "Cbot",
      threadTs: "1000.0",
      client,
    });

    expect(result).toHaveLength(1);
    expect(result[0].botId).toBe("B123");
  });
});
