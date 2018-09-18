import {
  Identifier,
  Dictionary,
  Sequence,
  Nothing,
  ScopeDeclarationBodyItem
} from "farmbot";
import { get, uniqBy } from "lodash";
import { defensiveClone } from "../../../util";

/** A less strict version of a CeleryScript node used for
 * the sake of recursion. */
interface Traversable {
  kind: string;
  args: Args;
  body?: Body;
}

/** Junk that we don't care about on a celery script node. */
type Other = string | number | object;
/** Less strict version of CeleryScript `args`-
 * It's either traversable, or we don't care. */
type Args = Dictionary<Traversable | Other>;
type Body = Traversable[] | undefined;
/** Accumulator for collecting identifiers found while recursing. */
type Accum = Identifier[];

export const NOTHING: Nothing = { kind: "nothing", args: {} };

/** Is it a variable (identifier)? */
const isIdentifier =
  (x: Traversable): x is Identifier => (x.kind === "identifier");

/** Is it a fully-formed CeleryScript node? Can we continue recursing? */
const isTraversable = (x: unknown): x is Traversable => {
  const kind: string | undefined = get(x, "kind");
  const args: object | undefined = get(x, "args");

  return !!((typeof kind == "string") && args && typeof args == "object");
};

/** Is it an _identifier_ node? Put it in the array if so.
 * If it is some other node type, continue recursion. */
const maybeCollect =
  (x: Traversable, y: Accum) => isIdentifier(x) ? y.push(x) : traverse(y)(x);

/** Maybe recurse into each leg of node.args */
const traverseArgs = (input: Args, accumulator: Accum) => {
  const keys = Object.keys(input);
  keys.map(key => {
    const value = input[key];
    isTraversable(value) && maybeCollect(value, accumulator);
  });
};

/** Iterate over node.body and perform recursion on each child node. */
const traverseBody = (input: Body, accumulator: Accum) => {
  input && input.map(traverse(accumulator));
};

/** Recurse into every leg of node.args and node.body, pushing all `identifier`
 * nodes into the `acc` array. */
const traverse = (acc: Accum = []) => (input: unknown): Accum => {
  if (isTraversable(input)) {
    traverseArgs(input.args, acc);
    traverseBody(input.body, acc);
  }

  return acc;
};

/** Used to remove duplicates */
const iteratee = (x: Identifier) => x.args["label"];

/** Collect ever `identifier` CeleryScript node in a sequence. */
export const collectAllVariables =
  (sequence: Sequence) => uniqBy(traverse([])(sequence), iteratee);

const generateDeclarationsFromIdentifiers = (s: Sequence) => {
  const { locals } = s.args;
  const lookup: Dictionary<ScopeDeclarationBodyItem | undefined> = {};
  (locals.body || []).map(x => (lookup[x.args.label] = x));

  return (identifier: Identifier): ScopeDeclarationBodyItem => {
    return lookup[identifier.args.label] || {
      kind: "variable_declaration",
      args: {
        label: identifier.args.label,
        data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
      }
    };
  };
};

/** Calculate the next value of sequence.arg.locals given a *new* list of
 * variables for a sequence. */
export const recomputeLocalVarDeclaration = (input: Sequence): Sequence => {
  const output = defensiveClone(input);
  const identifiers = collectAllVariables(output);

  const body = identifiers.map(generateDeclarationsFromIdentifiers(input));
  input.args.locals = { kind: "scope_declaration", args: {}, body };

  return input;
};
