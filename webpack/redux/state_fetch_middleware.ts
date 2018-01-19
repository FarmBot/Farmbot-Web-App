import { MiddlewareConfig } from "./middlewares";
import { Middleware } from "redux";

// Leaving this in as a no-op for debugging.
const stateFetchMiddleware: Middleware =
  (store) => (next) => (action: any) => next(action);

export const stateFetchMiddlewareConfig: MiddlewareConfig =
  ({ env: "*", fn: stateFetchMiddleware });
