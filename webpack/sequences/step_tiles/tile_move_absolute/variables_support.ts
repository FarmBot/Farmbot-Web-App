import { get, set } from "lodash";
import {
  Dictionary,
  Identifier,
  ScopeDeclarationBodyItem,
  uuid,
  VariableDeclaration
} from "farmbot";
import {
  SequenceResource as Sequence
} from "farmbot/dist/resources/api_resources";

// ======= TYPE DECLARATIONS =======
/** Less strict version of CeleryScript args. It's traversable, or unknown. */
type Args = Dictionary<Traversable | unknown>;
type Body = Traversable[] | undefined;
/** Less strict CeleryScript node used for the sake of recursion. */
interface Traversable { kind: string; args: Args; body?: Body; }
type TreeClimberCB = (item: Traversable) => void;
// ======= END TYPE DECLARATIONS =======

// ======= CONST / LITERAL / DYNAMIC KEY DECLARATIONS     =======
const ARGS = "args";
const IDENTIFIER = "identifier";
const KIND = "kind";
const OBJECT = "object";
const STRING = "string";
const UUID = "uuid";
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

const markWithUuid =
  (node: Traversable) => !get(node, UUID) && set(node, UUID, uuid());

const newVar = (label: string): VariableDeclaration => ({
  kind: "variable_declaration",
  args: {
    label,
    data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
  }
});

/** Calculate the next value of sequence.arg.locals given a *new* list of
 * variables for a sequence. */
export const performAllIndexesOnSequence = (input: Sequence): Sequence => {
  // Ideally, we want to be able to blindly insert identifiers into any part of
  // a sequence and have said identifier show up in the `scope_declaration`.

  const actuallyUsed: Dictionary<Identifier> = {};
  const declared: Dictionary<ScopeDeclarationBodyItem> = {};
  const body = (input.args.locals.body = input.args.locals.body || []);
  input.args.locals.body.map(item => declared[item.args.label] = item);
  const updateDeclarations = (node: Identifier) => {
    const varName = node.args.label;
    // STEP 1: Collect all the stuff thats been _declared_.
    actuallyUsed[varName] = node;

    /** Scenario: You referenced a variable, but it does not
     * exist in `seq.args.locals`. */
    if (!declared[varName]) {
      // STEP 2: Collect all stuff that's been _referenced_.
      // If it's not already in the sequence.args, declare it as an empty var.
      const declaration = newVar(varName);
      declared[varName] = declaration;
      body.push(declaration);
    }
  };

  climb(input, node => {
    markWithUuid(node);
    isIdentifier(node) && updateDeclarations(node);
  });

  return input;
};

export function climb(t: Traversable | unknown, cb: TreeClimberCB) {
  const climbArgs = (a: Args) => Object.keys(a).map(arg => climb(a[arg], cb));
  const climbBody = (body: Body = []) => body.map(item => climb(item, cb));

  if (isTraversable(t)) {
    console.log("Traversing " + t.kind);
    t.body = t.body || [];
    climbArgs(t.args);
    climbBody(t.body);
    cb(t);
  } else {
    console.log("Refusing to traverse " + JSON.stringify(t));
    return;
  }
}
