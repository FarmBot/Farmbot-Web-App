import { Identifier, Dictionary, Sequence } from "farmbot";
import { isObject as obj, isString as strn, uniqBy } from "lodash";

type Other = string | number | object;
type Args = Dictionary<Traversable | Other>;
type Body = Traversable[] | undefined;
type Accum = Identifier[];

interface Traversable {
  kind: string;
  args: Args;
  body?: Body;
}

const isIdentifier =
  (x: Traversable): x is Identifier => (x.kind === "identifier");

const isTraversable =
  // tslint:disable-next-line:no-any
  (x: any): x is Traversable => (obj(x) && obj(x.args) && strn(x.kind));

const maybeCollect =
  (x: Traversable, y: Accum) => isIdentifier(x) ? y.push(x) : traverse(y)(x);

const traverseArgs = (input: Args, accumulator: Accum) => {
  const keys = Object.keys(input);
  keys.map(key => {
    const value = input[key];
    isTraversable(value) && maybeCollect(value, accumulator);
  });
};

const traverseBody = (input: Body, accumulator: Accum) => {
  input && input.map(traverse(accumulator));
};

/** Recursively collects all `identifier` nodes in a sequence. */
const traverse = (acc: Accum = []) => (input: Traversable): Accum => {
  if (isTraversable(input)) {
    traverseArgs(input.args, acc);
    traverseBody(input.body, acc);
  }

  return acc;
};

/** Used to remove duplicates */
const iteratee = (x: Identifier) => x.args["label"];

export const collectAllVariables =
  (sequence: Sequence) => uniqBy(traverse([])(sequence), iteratee);
