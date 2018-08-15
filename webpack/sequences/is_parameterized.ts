import { TaggedSequence } from "farmbot";

/** Determine if a sequence has parameters */
export function isParameterized(s: TaggedSequence["body"]) {
  const array = (s.args.locals.body || []);
  const param1 = array.filter(x => x.kind === "parameter_declaration")[0];
  return !!param1;
}
