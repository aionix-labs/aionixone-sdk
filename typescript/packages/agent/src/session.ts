import type * as schema_types from "./generated/schema_types";

export type SessionRequestId = schema_types.AgentSessionRequestId;
export type SessionRequestContext = schema_types.AgentSessionRequestContext;

export function sessionRequestId(value: string): SessionRequestId {
  return value;
}

export function sessionRequest(
  id: SessionRequestId,
  payload: schema_types.AgentSessionClientRequestPayload,
): schema_types.AgentSessionClientEnvelope {
  return {
    kind: "request",
    message: {
      id,
      payload,
    },
  };
}

export function initializeRequest(
  id: SessionRequestId,
  params: schema_types.AgentSessionInitializeParams,
): schema_types.AgentSessionClientEnvelope {
  return sessionRequest(id, { initialize: params });
}

export function initializedRequest(
  id: SessionRequestId,
): schema_types.AgentSessionClientEnvelope {
  return sessionRequest(id, "initialized");
}

export function threadAttachRequest(
  id: SessionRequestId,
  context: SessionRequestContext,
  threadTrn: string,
  initialTurnsPage?: schema_types.ThreadInitialTurnsPageRequest | null,
): schema_types.AgentSessionClientEnvelope {
  return sessionRequest(id, {
    threadAttach: {
      context,
      threadTrn,
      initialTurnsPage,
    },
  });
}

export function threadDetachRequest(
  id: SessionRequestId,
  context: SessionRequestContext,
  threadTrn: string,
): schema_types.AgentSessionClientEnvelope {
  return sessionRequest(id, { threadDetach: { context, threadTrn } });
}

export function resolveInteractionRequest(
  id: SessionRequestId,
  context: SessionRequestContext,
  threadTrn: string,
  request: schema_types.ResolveThreadInteractionRequest,
): schema_types.AgentSessionClientEnvelope {
  return sessionRequest(id, {
    resolveInteraction: {
      context,
      threadTrn,
      request,
    },
  });
}

export function interruptRequest(
  id: SessionRequestId,
  context: SessionRequestContext,
  threadTrn: string,
  request: schema_types.InterruptThreadRequest,
): schema_types.AgentSessionClientEnvelope {
  return sessionRequest(id, {
    interrupt: {
      context,
      threadTrn,
      request,
    },
  });
}

export function rollbackRequest(
  id: SessionRequestId,
  context: SessionRequestContext,
  threadTrn: string,
  request: schema_types.RollbackThreadRequest,
): schema_types.AgentSessionClientEnvelope {
  return sessionRequest(id, {
    rollback: {
      context,
      threadTrn,
      request,
    },
  });
}

export function shutdownRequest(
  id: SessionRequestId,
  context: SessionRequestContext,
  threadTrn: string,
  request: schema_types.ShutdownThreadRequest,
): schema_types.AgentSessionClientEnvelope {
  return sessionRequest(id, {
    shutdown: {
      context,
      threadTrn,
      request,
    },
  });
}

export function isServerNotificationEnvelope(
  envelope: schema_types.AgentSessionServerEnvelope,
): envelope is {
  kind: "notification";
  message: schema_types.AgentSessionServerNotificationEnvelope;
} {
  return envelope.kind === "notification";
}

export function isServerResponseEnvelope(
  envelope: schema_types.AgentSessionServerEnvelope,
): envelope is { kind: "response"; message: schema_types.AgentSessionServerResponseEnvelope } {
  return envelope.kind === "response";
}

export function isServerErrorEnvelope(
  envelope: schema_types.AgentSessionServerEnvelope,
): envelope is { kind: "error"; message: schema_types.AgentSessionServerErrorEnvelope } {
  return envelope.kind === "error";
}
