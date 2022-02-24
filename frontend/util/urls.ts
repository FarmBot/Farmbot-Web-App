import { last } from "lodash";
import { getPathArray } from "../history";

/** When needing to reference the url in some js universally or vice versa. */
export function urlFriendly(stringToFormat: string) {
  return encodeURIComponent(stringToFormat.replace(/ /gi, "_"));
}

/** Get remainder of current url after the last "/". */
export const lastUrlChunk = (): string => last(getPathArray()) || "";

/** Fetch query value for the provided key. */
export const getUrlQuery = (key: string): string | undefined =>
  location.search
    .split(`?${key}=`).filter(x => x).pop()?.split("?")[0].split("#")[0];
