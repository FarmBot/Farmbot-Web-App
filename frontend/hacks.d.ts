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
  logStore: LogStore
}

declare namespace jest {
  export interface Matchers<R, T> {
    toBeSameTimeAs: jest.Expect;
  }
}

declare var mockNavigate: jest.Mock;

declare module 'fengari-web';
