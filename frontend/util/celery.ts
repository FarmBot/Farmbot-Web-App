import { Dictionary } from "lodash";
import { Pair } from "farmbot/dist/corpus";

type PrimitiveMap = Dictionary<string | number | boolean | undefined>;

export function toPairs(input: PrimitiveMap): Pair[] {
  return Object.keys(input).map(function (key): Pair {
    return {
      kind: "pair",
      args: { label: key, value: input[key] || "null" }
    };
  });
}
