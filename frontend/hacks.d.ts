/** This contains all of the global ENV vars passed from server => client.
 * Previously was `process.env.XYZ`. */
declare var globalConfig: { [k: string]: string };

type LogLevel = "debug" | "info" | "warn" | "error";
type LogPayload = { [k: string]: string | number | boolean };
interface LogStore {
  log(message: string, payload?: LogPayload, level?: LogLevel): void;
}

interface Rollbar {
  error?(msg: string | object): void;
  configure(object: object): object;
}

interface AppSig {
  use: Function;
}

interface Window {
  Rollbar: Rollbar | undefined;
  logStore: LogStore;
  __fps?: number;
  __scene_metrics?: string;
  __threeDRenderMetrics?: {
    calls: number;
    triangles: number;
    geometries: number;
    textures: number;
  };
  __fbPerf?: {
    startedAt: number;
    marks: Record<string, number[]>;
    counts: Record<string, number>;
    samples: Record<string, number[]>;
  };
  __threeDBotBenchmark?: {
    active(): boolean;
    config(): {
      cableCarriers: boolean;
      trail: boolean;
      waterFlow: boolean;
    };
    moveTo(position: { x: number; y: number; z: number }): Promise<void>;
    position(): { x: number; y: number; z: number } | undefined;
    setWater(enabled: boolean): void;
  };
}

declare namespace jest {
  export interface Matchers<R, T> {
    toBeSameTimeAs: jest.Expect;
  }
}

declare var mockNavigate: jest.Mock;

declare module 'fengari-web';

declare module "*.css";

declare module "*.bin" {
  const assetUrl: string;
  export default assetUrl;
}
