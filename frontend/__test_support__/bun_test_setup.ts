import { afterEach, beforeEach, jest as bunJest, mock as bunMock } from "bun:test";
import { createRequire } from "module";
import { TextEncoder } from "util";
import fs from "fs";
import path from "path";
import { cleanup } from "@testing-library/react";

const globalAny = globalThis as typeof globalThis & {
  globalConfig?: Record<string, string>;
  window?: Window & typeof globalThis;
  jest?: typeof bunJest & {
    requireActual?: (specifier: string) => unknown;
    unmock?: (specifier: string) => void;
    isMockFunction?: (fn: unknown) => boolean;
  };
};

const originalDocumentQuerySelector = document.querySelector.bind(document);
const originalSyntaxError = globalThis.SyntaxError;
const ensureSyntaxError = () => {
  const assign = (target: Record<string, unknown> | undefined) => {
    if (!target) { return; }
    Object.defineProperty(target, "SyntaxError", {
      value: originalSyntaxError,
      configurable: true,
      writable: true,
    });
  };
  assign(globalThis as unknown as Record<string, unknown>);
  assign(globalAny.window as unknown as Record<string, unknown> | undefined);
  const windowCtor = globalAny.window?.constructor as
    | { prototype?: Record<string, unknown> }
    | undefined;
  assign(windowCtor?.prototype);
};

ensureSyntaxError();

if (!globalAny.globalConfig) {
  globalAny.globalConfig = {
    NODE_ENV: "development",
    TOS_URL: "https://farm.bot/tos/",
    PRIV_URL: "https://farm.bot/privacy/",
    LONG_REVISION: "------------",
    SHORT_REVISION: "--------",
    MINIMUM_FBOS_VERSION: "6.0.0",
    FBOS_END_OF_LIFE_VERSION: "0.0.0",
    ROLLBAR_CLIENT_TOKEN: "",
  };
}

if (!globalAny.jest) {
  globalAny.jest = bunJest;
}
globalThis.TextEncoder = TextEncoder;

const withAxiosDefaultExport = (factory: () => unknown) => () => {
  const mockedModule = factory();
  if (!mockedModule || typeof mockedModule !== "object") {
    return mockedModule;
  }
  if ("default" in mockedModule) {
    return mockedModule;
  }
  return {
    __esModule: true,
    ...mockedModule,
    default: mockedModule,
  };
};

if (globalAny.jest?.mock) {
  const originalMock = globalAny.jest.mock.bind(globalAny.jest);
  globalAny.jest.mock = ((specifier: string, factory?: unknown) => {
    return specifier === "axios" && typeof factory === "function"
      ? originalMock(specifier, withAxiosDefaultExport(factory))
      : originalMock(specifier, factory as never);
  }) as typeof globalAny.jest.mock;
}

const patchThreeStdlib = () => {
  const esmFiles = [
    "node_modules/three-stdlib/postprocessing/GlitchPass.js",
    "node_modules/three-stdlib/postprocessing/SSAOPass.js",
  ];
  for (const file of esmFiles) {
    const full = path.resolve(process.cwd(), file);
    if (!fs.existsSync(full)) { continue; }
    const content = fs.readFileSync(full, "utf8");
    let updated = content.replace(/,\s*LuminanceFormat\b/g, "");
    updated = updated.replace(/\bLuminanceFormat\b/g, "RedFormat");
    updated = updated.replace(/RedFormat\s*,\s*RedFormat/g, "RedFormat");
    if (updated !== content) {
      fs.writeFileSync(full, updated, "utf8");
    }
  }

  const cjsFiles = [
    "node_modules/three-stdlib/postprocessing/GlitchPass.cjs",
    "node_modules/three-stdlib/postprocessing/SSAOPass.cjs",
  ];
  for (const file of cjsFiles) {
    const full = path.resolve(process.cwd(), file);
    if (!fs.existsSync(full)) { continue; }
    const content = fs.readFileSync(full, "utf8");
    const updated = content.replace(/LuminanceFormat/g, "RedFormat");
    if (updated !== content) {
      fs.writeFileSync(full, updated, "utf8");
    }
  }
};

patchThreeStdlib();

const nativeRequire = createRequire(import.meta.url);

const stackToPath = (line: string): string | undefined => {
  const withParens = line.match(/\((.+):\d+:\d+\)$/);
  if (withParens?.[1]) {
    return withParens[1];
  }
  const withoutParens = line.match(/at (.+):\d+:\d+$/);
  return withoutParens?.[1];
};

const getCallerFile = (): string | undefined => {
  const stack = new Error().stack?.split("\n") ?? [];
  for (const line of stack.slice(2)) {
    if (line.includes("bun_test_setup")) {
      continue;
    }
    const filePath = stackToPath(line.trim());
    if (!filePath) {
      continue;
    }
    if (filePath.includes("node_modules")) {
      continue;
    }
    return filePath.replace("file://", "");
  }
  return undefined;
};

const resolveFromCaller = (specifier: string) => {
  const callerFile = getCallerFile();
  if (!callerFile) {
    return specifier;
  }
  if (specifier.startsWith(".") || specifier.startsWith("/")) {
    return path.resolve(path.dirname(callerFile), specifier);
  }
  return specifier;
};

if (globalAny.jest) {
  if (!globalAny.jest.requireActual) {
    globalAny.jest.requireActual = (specifier: string) => {
      const resolved = resolveFromCaller(specifier);
      return nativeRequire(resolved);
    };
  }
  if (!globalAny.jest.unmock) {
    globalAny.jest.unmock = (specifier: string) => {
      const resolved = resolveFromCaller(specifier);
      bunMock.module(specifier, () => nativeRequire(resolved));
    };
  }
  if (!globalAny.jest.isMockFunction) {
    globalAny.jest.isMockFunction = (fn: unknown) =>
      typeof fn === "function" && "mock" in fn;
  }
}

await import("./localstorage");
await import("./additional_mocks");
await import("./mock_fbtoaster");
await import("./mock_i18next");
await import("./three_d_mocks");
const threeFiber = await import("@react-three/fiber");
const THREE = await import("three");
await import("jest-canvas-mock");
await import("./setup_tests");
const { auth } = await import("./fake_state/token");
const { bot } = await import("./fake_state/bot");
const { config } = await import("./fake_state/config");
const { draggable } = await import("./fake_state/draggable");
const { app } = await import("./fake_state/app");

const cloneForReset = <T>(value: T): T => structuredClone(value);
const resetMutableFixture = <T extends Record<string, unknown>>(
  fixture: T,
  baseline: T,
) => {
  Object.keys(fixture).forEach(key => {
    delete fixture[key as keyof T];
  });
  Object.assign(fixture, cloneForReset(baseline));
};

const authBaseline = cloneForReset(auth);
const botBaseline = cloneForReset(bot);
const configBaseline = cloneForReset(config);
const draggableBaseline = cloneForReset(draggable);
const appBaseline = cloneForReset(app);
const globalConfigBaseline = cloneForReset(globalAny.globalConfig ?? {});

const defaultThreeFiberState = () => ({
  clock: { getElapsedTime: jest.fn(() => 0) },
  camera: new THREE.PerspectiveCamera(),
  gl: {
    info: {
      render: { calls: 0, triangles: 0, points: 0, lines: 0 },
      memory: { geometries: 0, textures: 0 },
    },
  },
  scene: { traverse: jest.fn() },
  size: { width: 800, height: 600 },
  pointer: { x: 0, y: 0 },
});

type MockLike = {
  mockImplementation: (impl: (...args: unknown[]) => unknown) => unknown;
};

const asMockLike = (value: unknown): MockLike | undefined =>
  globalAny.jest?.isMockFunction?.(value)
    ? value as MockLike
    : undefined;

const resetThreeFiberHookMocks = () => {
  asMockLike(threeFiber.useFrame)?.mockImplementation(
    (callback: (state: ReturnType<typeof defaultThreeFiberState>) => unknown) =>
      callback(defaultThreeFiberState()));
  asMockLike(threeFiber.useThree)?.mockImplementation(
    () => defaultThreeFiberState());
};

beforeEach(() => {
  bunJest.clearAllMocks();
  resetThreeFiberHookMocks();
  resetMutableFixture(auth, authBaseline);
  resetMutableFixture(bot, botBaseline);
  resetMutableFixture(config, configBaseline);
  resetMutableFixture(draggable, draggableBaseline);
  resetMutableFixture(app, appBaseline);
  if (globalAny.globalConfig) {
    resetMutableFixture(globalAny.globalConfig, globalConfigBaseline);
  } else {
    globalAny.globalConfig =
      cloneForReset(globalConfigBaseline) as Record<string, string>;
  }
  globalThis.localStorage?.clear();
  globalThis.sessionStorage?.clear();
  globalAny.window?.localStorage?.clear();
  globalAny.window?.sessionStorage?.clear();
  const globalWithMocks = globalThis as typeof globalThis & {
    mockNavigate?: ReturnType<typeof jest.fn>;
  };
  if (typeof globalWithMocks.mockNavigate === "function") {
    globalWithMocks.mockNavigate.mockClear();
  } else {
    globalWithMocks.mockNavigate = jest.fn(() => jest.fn());
  }
  Object.defineProperty(document, "querySelector", {
    value: originalDocumentQuerySelector,
    configurable: true,
  });
  ensureSyntaxError();
});

afterEach(() => {
  Object.defineProperty(document, "querySelector", {
    value: originalDocumentQuerySelector,
    configurable: true,
  });
  ensureSyntaxError();
  bunJest.restoreAllMocks?.();
  bunJest.useRealTimers?.();
  cleanup();
});
