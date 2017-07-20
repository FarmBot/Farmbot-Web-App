import * as React from "react";
import * as _ from "lodash";

type OptionComponent =
  | React.ComponentClass<DropDownItem>
  | React.StatelessComponent<DropDownItem>;

export interface DropDownItem {
  /** Name of the item shown in the list. */
  label: string;
  /** Value passed to the onClick cb and also determines the "chosen" option. */
  value: number | string;
  /** To determine group-by styling on rendered lists. */
  heading?: boolean;
  /** A unique ID to group headings by. */
  headingId?: string | undefined;
  /** This is just an idea. */
  children?: DropDownItem[] | undefined
}

export interface SelectProps {
  /** The list of rendered options to select from. */
  list: DropDownItem[];
  /** Determines what label to show in the select box. */
  initialValue?: DropDownItem | undefined;
  /** Determine whether the select list should always be open. */
  isOpen?: boolean;
  /** Custom JSX child rendered instead of a default item. */
  optionComponent?: OptionComponent;
  /** Optional className for `select`. */
  className?: string;
  /** Fires when option is selected. */
  onChange?: (newValue: DropDownItem) => void;
  /** Fires when user enters text */
  onUserTyping?: (userInput: string) => void;
  /** Placeholder for the input. */
  placeholder?: string;
  /** Allows user to have a non-selected value. */
  allowEmpty?: boolean;
  /** Id for the input. Used for accessibility and expected ux with labels. */
  id?: string | undefined;
}

export interface SelectState {
  touched: boolean;
  label: string;
  isOpen: boolean;
  value: string | number | undefined;
}

/** Used as a placeholder for a selection of "none" when allowEmpty is true. */
export const NULL_CHOICE: DropDownItem = Object.freeze({
  label: "None",
  value: ""
});
