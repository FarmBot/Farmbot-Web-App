import { get, set } from "lodash";
import { SequenceBodyItem, uuid } from "farmbot/dist";
import {
  Traversable
} from "../sequences/locals_list/variables_support";

/** HISTORICAL NOTES:
 *   This file is the result of some very subtle bugs relating to dynamic
 *   children in React components on the sequence editor page. Simply put, the
 *   sequence editor needs a way to uniquely identify each sequence step when
 *   rendering a sequence.
 *
 * PROBLEM:
 * - React needs a unique `key` prop when iterating over UI list elements.
 * - The only unique key on a sequence step is its index within the array.
 * - An array index is not adequate for tracking highly dynamic content changes
 *   such as changes seen within the sequence editor.
 * - If you *do* use only the array index as a `key` prop in the editor,
 *   the UI may become out of sync with the underlying data.
 * - The JSON returned from the server is not adequate for uniquely tracking
 *   each step in this situation.
 * - Changing the underlying structure of CeleryScript globally to fix a problem
 *   seen only in the sequence editor is a not-so-great idea.
 *
 * SOLUTION:
 *   To get around this, we sneakily add a `uuid` property to the all sequence
 *   steps. They are ignored by the API. `step.uuid` can be used anywhere a
 *   tracking `key={}` is required when iterating over sequence steps in the UI.
 *
 * RATIONALE:
 *   We could change the way CeleryScript is structured globally, but that has
 *   no usefulness outside of the sequence editor UI. Also, retroactively
 *   updating sequence steps already in the database can be error prone and time
 *   consuming. I would rather put a hack in one place (here) rather than force
 *   all other parts of the product to support it.
 *
 * OTHER IMPORTANT THINGS:
 *   My goal is to keep as much UUID tagging logic as possible in this file
 *   only. When a more elegant solution appears, it will be easier to remove.
 *   Please *AVOID MOVING THESE FUNCTIONS AND INTERFACES INTO SEPARATE FILES*.
 *
 * FURTHER READING:
 *   https://facebook.github.io/react/docs/lists-and-keys.html
 *
 * -RC 6-Aug-17
 */

/** Type alias for the data type used to tag steps.
 * Currently `string`. Formerly `number`. */
export type StepTag = string;

/** Property name where a unique ID is stored in a step. */
const TAG_PROP = "uuid";

export const maybeTagStep =
  (t: Traversable) => !get(t, TAG_PROP) && forceSetStepTag(t);

export const forceSetStepTag = <T extends Traversable>(node: T): T => {
  set(node, TAG_PROP, uuid());
  return node;
};

/** VERY IMPORTANT FUNCTION.
 *  SEE HEADER AT TOP OF FILE.
 * Retrieves tag from a step object. Assumes that all steps have a tag.
 * If no tag is found, crashes. */
export function getStepTag(i: SequenceBodyItem): StepTag {
  const tag = get(i, TAG_PROP, "");
  if (tag) { return tag; }
  throw new Error("No tag on step: " + i.kind);
}
