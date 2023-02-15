export interface DropDownItem {
  /** Name of the item shown in the list. */
  label: string;
  /** Value passed to the onClick cb and also determines the "chosen" option. */
  value: number | string;
  /** To determine group-by styling on rendered lists. */
  heading?: boolean;
  /** A unique ID to group headings by. */
  headingId?: string | undefined;
  /** Mostly for legacy reasons. Indicates that the current object is the
   * NULL_CHOICE ddi */
  isNull?: true;
  /** Add warning styling. */
  warn?: boolean;
}

interface NullChoice extends DropDownItem { label: "None"; value: ""; }
const nc: NullChoice = { label: "None", value: "", isNull: true };
/** Used as a placeholder for a selection of "none" when allowEmpty is true. */
export const NULL_CHOICE = Object.freeze(nc);
