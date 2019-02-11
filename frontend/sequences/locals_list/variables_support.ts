import { get, uniq } from "lodash";
import {
  Dictionary,
  Identifier,
  ScopeDeclarationBodyItem,
  VariableDeclaration,
  Execute
} from "farmbot";
import {
  SequenceResource as Sequence
} from "farmbot/dist/resources/api_resources";
import { maybeTagStep } from "../../resources/sequence_tagging";
import { NOTHING_SELECTED } from "./handle_select";

// ======= TYPE DECLARATIONS =======
/** Less strict version of CeleryScript args. It's traversable, or unknown. */
type Args = Dictionary<Traversable | unknown>;
type Body = Traversable[] | undefined;
/** Less strict CeleryScript node used for the sake of recursion. */
export interface Traversable { kind: string; args: Args; body?: Body; }
type TreeClimberCB = (item: Traversable) => void;
type InterestingNodes = Identifier | Execute;
// ======= END TYPE DECLARATIONS =======

// ======= CONST / LITERAL / DYNAMIC KEY DECLARATIONS =======
const ARGS: keyof InterestingNodes = "args";
const KIND: keyof InterestingNodes = "kind";
const IDENTIFIER: Identifier["kind"] = "identifier";
const EXECUTE: Execute["kind"] = "execute";
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

/** Is it an execute block? */
const isExecute = (x: Traversable): x is Execute => {
  return !!((x.kind === EXECUTE) && (x as Execute).args.sequence_id);
};

const newVar = (label: string): VariableDeclaration => ({
  kind: "variable_declaration",
  args: { label, data_value: NOTHING_SELECTED }
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

interface SanitizationResult {
  thisSequence: Sequence;
  callsTheseSequences: number[];
}

/* 1. Recursively tag all CeleryScript nodes with a `uuid` property to
 *    prevent subtle React issues. SEE: Explanation in `sequence_tagging.ts`
 * 2. Add unbound variables to `locals` declaration (prevent NPEs).
 * 3. Remove unused variables from `locals` declaration. */
export const sanitizeNodes = (thisSequence: Sequence): SanitizationResult => {
  // Collect all *declared* variables. Required for fixing unbound vars.
  const declared: Dictionary<ScopeDeclarationBodyItem> = {};
  (thisSequence.args.locals.body || []).map(var_ => declared[var_.args.label] = var_);
  const { id } = thisSequence;
  // Collect all *referenced* variables. Required for removing unused vars.
  const used: Dictionary<Identifier> = {};
  const collectUniqVariables = (_id: Identifier) => used[_id.args.label] = _id;
  const idList: number[] = [];
  climb(thisSequence, node => {
    maybeTagStep(node);
    isIdentifier(node) && collectUniqVariables(node);
    if (isExecute(node)) {
      const { sequence_id } = node.args;
      // Recursion does not qualify as "in_use"
      (sequence_id != id) && idList.push(sequence_id);
    }
  });
  // Add unbound variables to locals array. Unused variables magically disappear
  thisSequence.args.locals.body = Object.values(used)
    .map(({ args }) => declared[args.label] || newVar(args.label))
    .map(node => {
      maybeTagStep(node);
      return node;
    });

  return { thisSequence, callsTheseSequences: uniq(idList) };
};
