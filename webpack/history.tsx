import { navigate } from "takeme";

export let push = (url: string) => navigate(url);

/** This is a stub from the `react-router`.
 * Don't use it anymore. */
export let history = { push, getCurrentLocation: () => window.location };

export function getPathArray() {
  return location.pathname.split("/");
}
