import {
  initializeRequest,
  sessionRequestId,
  threadAttachRequest,
} from "../src/session";
import type { schema_types } from "../src/index";

const requestContext: schema_types.AgentSessionRequestContext = {
  tenant: "test0001",
  requestId: "req-1",
};

const initializeEnvelope = initializeRequest(sessionRequestId("init-1"), {
  clientInfo: {
    name: "sdk-test",
    version: "0.1.0",
  },
  capabilities: {
    optOutNotificationMethods: ["thread/stream/event"],
  },
});

const attachEnvelope = threadAttachRequest(
  sessionRequestId("attach-1"),
  requestContext,
  "trn:agent:tenant:test0001:thread/support/triage/thread-1",
  { limit: 10 },
);

const [_initKind, _attachKind] = [
  initializeEnvelope.kind,
  attachEnvelope.kind,
];
