import { cloneDeep, get, uniq } from "lodash";
import {
  Dictionary,
  Identifier,
  ScopeDeclarationBodyItem,
  VariableDeclaration,
  Execute,
} from "farmbot";
import {
  SequenceResource as Sequence,
} from "farmbot/dist/resources/api_resources";
import { maybeTagStep } from "../../resources/sequence_tagging";
import { newVariableDataValue, varTypeFromLabel } from "./new_variable";

// ======= TYPE DECLARATIONS =======
/** Less strict version of CeleryScript args. It's traversable, or unknown. */
type Args = Dictionary<unknown>;
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
  args: { label, data_value: newVariableDataValue(varTypeFromLabel(label)) }
});

function climb(t: unknown, cb: TreeClimberCB) {
  const climbArgs = /** RECURSION ALERT! */
    (a: Args) => Object.keys(a).map(arg => climb(a[arg], cb));
  const climbBody = /** WEE OOO WEE OO */
    (body: Traversable[]) => body.map(item => climb(item, cb));

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
 */
export const sanitizeNodes = (thisSequence: Sequence): SanitizationResult => {
  // Collect all *declared* variables.
  const declared: Dictionary<ScopeDeclarationBodyItem> = {};
  (thisSequence.args.locals.body || []).map(variable =>
    declared[variable.args.label] = variable);
  // Collect all *referenced* variables.
  const { id } = thisSequence;
  const used: Dictionary<Identifier> = {};
  const collectUniqVariables = (identifier: Identifier) =>
    used[identifier.args.label] = identifier;
  const idList: number[] = [];
  climb(thisSequence, node => {
    maybeTagStep(node);
    isIdentifier(node) && collectUniqVariables(node);
    // Collect "in_use" sequences.
    if (isExecute(node)) {
      const { sequence_id } = node.args;
      // Recursion does not qualify as "in_use"
      (sequence_id != id) && idList.push(sequence_id);
    }
  });
  // Collect all unused variables.
  const unused: ScopeDeclarationBodyItem[] = Object.values(declared)
    .filter(var_ => !Object.keys(used).includes(var_.args.label));
  // Add unbound variables to locals array.
  thisSequence.args.locals.body = Object.values(used)
    .map(({ args }) => declared[args.label] || newVar(args.label))
    .concat(unused)
    .map(node => {
      maybeTagStep(node);
      return node;
    });

  return { thisSequence, callsTheseSequences: uniq(idList) };
};

export const variableIsInUse = (sequence: Sequence | undefined, label: string) => {
  const usedLabels: string[] = [];
  climb(cloneDeep(sequence),
    node => isIdentifier(node) && usedLabels.push(node.args.label));
  return usedLabels.includes(label);
};
