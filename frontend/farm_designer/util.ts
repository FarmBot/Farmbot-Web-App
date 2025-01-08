import { ExecutableType } from "farmbot/dist/resources/api_resources";

function isExecutableType(x?: string): x is ExecutableType {
  const EXECUTABLES: ExecutableType[] = ["Sequence", "Regimen"];
  return !!EXECUTABLES.includes(x as ExecutableType);
}

/** USE CASE: You have a `string?` type that you are *certain*
 *            is an `ExecutableType`. But the type checker is
 *            complaining.
 *
 *  PROBLEM:  `as ExecutableType` results in less type safety and
 *            makes bugs harder to pin point in production.
 *
 * SOLUTION:  Run a user defined type guard (`x is ExecutableType`)
 *            and raise a runtime error with the offending string
 */
export function executableType(input?: string): ExecutableType {
  if (isExecutableType(input)) {
    return input;
  } else {
    throw new Error("Assumed string was ExecutableType. Got: " + input);
  }
}
