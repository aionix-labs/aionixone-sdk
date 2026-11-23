# `@aionix/client-agent`

Generated agent service SDK package.

## Session Schema

For websocket session payloads, use the generated contract-owned session schema surface.
Do not hand-write websocket envelope shapes.

### TypeScript

Use the service SDK helpers for request/response envelopes:

```ts
import {
  initializeRequest,
  sessionRequestId,
  threadAttachRequest,
} from "@aionix/client-agent/session";
import type { schema_types } from "@aionix/client-agent";

const context: schema_types.AgentSessionRequestContext = {
  tenant: "test0001",
  requestId: "req-1",
};

const initialize = initializeRequest(sessionRequestId("init-1"), {
  clientInfo: { name: "app", version: "0.1.0" },
});

const attach = threadAttachRequest(
  sessionRequestId("attach-1"),
  context,
  "trn:agent:tenant:test0001:thread/runtime-assistant/thread-1",
  { limit: 10 },
);
```

Use raw generated schema types directly when you need schema-only imports:

```ts
import type { AgentSessionServerEnvelope } from "@aionix/client-types/agent";
```
