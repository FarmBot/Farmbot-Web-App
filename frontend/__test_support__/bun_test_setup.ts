import { GlobalRegistrator } from "@happy-dom/global-registrator";
// eslint-disable-next-line import/no-unresolved
import { afterAll, afterEach, beforeEach, jest as bunJest, mock as bunMock } from "bun:test";
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { auth } from "./fake_state/token";
import { bot } from "./fake_state/bot";
import { config } from "./fake_state/config";
import { draggable } from "./fake_state/draggable";
import { app } from "./fake_state/app";

GlobalRegistrator.register({
  url: "http://localhost/",
  settings: {
    disableJavaScriptFileLoading: true,
    handleDisabledFileLoadingAsSuccess: true,
  },
});

const globalAny = globalThis as typeof globalThis & {
  globalConfig?: Record<string, string>;
  window?: Window & typeof globalThis;
  jest?: typeof bunJest & {
    requireActual?: (specifier: string) => unknown;
    unmock?: (specifier: string) => void;
    isMockFunction?: (fn: unknown) => boolean;
  };
};

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

await import("./setup_enzyme");
await import("./localstorage");
await import("./mock_fbtoaster");
await import("./mock_i18next");
await import("./additional_mocks");
await import("./three_d_mocks");
await import("jest-canvas-mock");
await import("./setup_tests");

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

beforeEach(() => {
  bunJest.clearAllMocks();
  resetMutableFixture(auth, authBaseline);
  resetMutableFixture(bot, botBaseline);
  resetMutableFixture(config, configBaseline);
  resetMutableFixture(draggable, draggableBaseline);
  resetMutableFixture(app, appBaseline);
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
});

afterEach(() => {
  bunJest.restoreAllMocks?.();
  bunMock.restore?.();
  bunJest.useRealTimers?.();
  bunJest.resetModules?.();
});

afterAll(async () => {
  if (GlobalRegistrator.isRegistered) {
    await GlobalRegistrator.unregister();
  }
});
