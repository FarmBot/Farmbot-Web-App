import React from "react";
import { Provider as RollbarProvider } from "@rollbar/react";
import { Session } from "./session";

interface RollbarTrace {
  frames?: { filename?: string }[];
}

export interface RollbarPayload {
  body?: {
    trace?: RollbarTrace;
    trace_chain?: RollbarTrace[];
  };
}

export const redact = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value.replace(
      /(["']?authorization["']?\s*[:=]\s*["']?)(?:bearer\s+)?[^"',}\s\\]+/gi,
      "$1---");
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      value[index] = redact(item);
    });
  } else if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    Object.keys(object).forEach(key => {
      object[key] = key.toLowerCase() === "authorization"
        ? "---"
        : redact(object[key]);
    });
  }
  return value;
};

export const normalizeRollbarAssetUrls = (payload: RollbarPayload) => {
  const traces = [payload.body?.trace, ...(payload.body?.trace_chain || [])];
  traces.forEach(trace => {
    trace?.frames?.forEach(frame => {
      const filename = frame.filename;
      if (filename) {
        frame.filename = filename.replace(
          /^(https?):\/\/[^/]+(\/assets\/dist\/)/,
          "$1://dynamichost$2",
        );
      }
    });
  });
};

export const prepareRollbarPayload = (payload: RollbarPayload) => {
  normalizeRollbarAssetUrls(payload);
  redact(payload);
};

export const RollbarWrapper = ({ children }: {
  children: React.ReactNode;
}) =>
  globalConfig.ROLLBAR_CLIENT_TOKEN
    ? <RollbarProvider config={{
      accessToken: globalConfig.ROLLBAR_CLIENT_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true,
      transform: (payload: RollbarPayload) => prepareRollbarPayload(payload),
      payload: {
        person: { id: "" + (Session.fetchStoredToken()?.user.id || 0) },
        environment: window.location.host,
        client: {
          javascript: {
            source_map_enabled: true,
            code_version: globalConfig.SHORT_REVISION,
            guess_uncaught_frames: true,
          },
        },
      },
    }}>{children}</RollbarProvider>
    : <>{children}</>;
