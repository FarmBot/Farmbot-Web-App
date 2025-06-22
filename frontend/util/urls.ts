/** When needing to reference the url in some js universally or vice versa. */
export function urlFriendly(stringToFormat: string) {
  return encodeURIComponent(stringToFormat.replace(/ /gi, "_"));
}

/** Fetch query value for the provided key. */
export const getUrlQuery = (key: string): string | undefined =>
  new URLSearchParams(location.search).get(key)?.split("#")[0] || undefined;
