/** The input of an axios error interceptor is an "any" type.
 * Sometimes it will be a real Axios error, other times it will not be.
 */
export interface SafeError {
  request: {
    responseURL: string;
  },
  response: {
    status: number;
  };
}

/** Prevents hard-to-find NPEs and type errors inside of interceptors. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSafeError(x: any): x is SafeError {
  return typeof x?.response?.status === "number";
}
