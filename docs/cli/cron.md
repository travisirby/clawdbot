---
summary: "CLI reference for `clawdbot cron` (schedule and run background jobs)"
read_when:
  - You want scheduled jobs and wakeups
  - You’re debugging cron execution and logs
---

# `clawdbot cron`

Manage cron jobs for the Gateway scheduler.

Related:
- Cron jobs: [Cron jobs](/automation/cron-jobs)

Tip: run `clawdbot cron --help` for the full command surface.

## Common edits

Update delivery settings without changing the message:

```bash
clawdbot cron edit <job-id> --deliver --channel telegram --to "123456789"
```

Disable delivery for an isolated job:

```bash
clawdbot cron edit <job-id> --no-deliver
```

## Quick tests

Send a one-shot test to Slack `#test` (isolated session; explicit delivery target):

```bash
clawdbot cron add \
  --name "Cron test (Slack)" \
  --at "5m" \
  --session isolated \
  --message "Send: hello from cron isolated." \
  --deliver \
  --channel slack \
  --to "channel:C1234567890"
```

Send a one-shot test to Discord `#test`:

```bash
clawdbot cron add \
  --name "Cron test (Discord)" \
  --at "5m" \
  --session isolated \
  --message "Send: hello from cron isolated." \
  --deliver \
  --channel discord \
  --to "channel:123456789012345678"
```

Notes:
- Isolated runs start with no conversation history; they can still read `MEMORY.md` and `memory/*.md`.
- If you omit `--to`, cron may fall back to the main session’s last route; for predictable tests, set `--to` explicitly.
