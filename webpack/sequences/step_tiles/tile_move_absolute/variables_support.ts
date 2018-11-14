import { get } from "lodash";
import {
  Dictionary,
  Identifier,
  ScopeDeclarationBodyItem,
  VariableDeclaration
} from "farmbot";
import {
  SequenceResource as Sequence
} from "farmbot/dist/resources/api_resources";
import { maybeTagStep } from "../../../resources/sequence_tagging";

// ======= TYPE DECLARATIONS =======
/** Less strict version of CeleryScript args. It's traversable, or unknown. */
type Args = Dictionary<Traversable | unknown>;
type Body = Traversable[] | undefined;
/** Less strict CeleryScript node used for the sake of recursion. */
export interface Traversable { kind: string; args: Args; body?: Body; }
type TreeClimberCB = (item: Traversable) => void;
// ======= END TYPE DECLARATIONS =======

// ======= CONST / LITERAL / DYNAMIC KEY DECLARATIONS     =======
const ARGS = "args";
const IDENTIFIER = "identifier";
const KIND = "kind";
const OBJECT = "object";
const STRING = "string";
// ======= END CONST / LITERAL DECLARATIONS =======

/** Is it a fully-formed CeleryScript node? Can we continue recursing? */
const isTraversable = (x: unknown): x is Traversable => {
  const hasKind = typeof get(x, KIND, -1) == STRING;
  const hasArgs = typeof get(x, ARGS, -1) == OBJECT;
  return hasKind && hasArgs;
};

/** Is it a variable (identifier)? */
const isIdentifier =
  (x: Traversable): x is Identifier => (x.kind === IDENTIFIER);

const newVar = (label: string): VariableDeclaration => ({
  kind: "variable_declaration",
  args: {
    label,
    data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
  }
});

export function climb(t: Traversable | unknown, cb: TreeClimberCB) {
  const climbArgs = /** RECURSION ALERT! */
    (a: Args) => Object.keys(a).map(arg => climb(a[arg], cb));
  const climbBody = /** WEE OOO WEE OO */
    (body: Body = []) => body.map(item => climb(item, cb));

  if (isTraversable(t)) {
    t.body = t.body || [];
    climbArgs(t.args);
    climbBody(t.body);
    cb(t);
  }
}

/* 1. Recursively tag all CeleryScript nodes with a `uuid` property to
 *    prevent subtle React issues. SEE: Explanation in `sequence_tagging.ts`
 * 2. Add unbound variables to `locals` declaration (prevent NPEs).
 * 3. Remove unused variables from `locals` declaration. */
export const sanitizeNodes = (input: Sequence): Sequence => {
  // Collect all *declared* variables. Required for fixing unbound vars.
  const declared: Dictionary<ScopeDeclarationBodyItem> = {};
  (input.args.locals.body || []).map(var_ => declared[var_.args.label] = var_);

  // Collect all *referenced* variables. Required for removing unused vars.
  const used: Dictionary<Identifier> = {};
  const collectUniqVariables = (id: Identifier) => used[id.args.label] = id;

  climb(input, node => {
    maybeTagStep(node);
    isIdentifier(node) && collectUniqVariables(node);
  });

  // Add unbound variables to locals array. Unused variables magically disappear
  input.args.locals.body = Object.values(used)
    .map(({ args }) => declared[args.label] || newVar(args.label))
    .map(node => {
      maybeTagStep(node);
      return node;
    });

  return input;
};
