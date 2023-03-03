/** When needing to reference the url in some js universally or vice versa. */
export function urlFriendly(stringToFormat: string) {
  return encodeURIComponent(stringToFormat.replace(/ /gi, "_"));
}

/** Fetch query value for the provided key. */
export const getUrlQuery = (key: string): string | undefined =>
  location.search
    .split(`?${key}=`).filter(x => x).pop()?.split("?")[0].split("#")[0];
