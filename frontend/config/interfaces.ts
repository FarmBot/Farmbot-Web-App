/** Payload of CHANGE_API_HOST */
export interface ChangeApiHost { host: string; }

/** Payload of CHANGE_API_PORT */
export interface ChangeApiPort { port: string; }

/** This is a subset of attributes found on window.location. */
export interface ConfigState {
  host: string;
  port: string;
}
