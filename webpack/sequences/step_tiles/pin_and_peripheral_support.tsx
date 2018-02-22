import * as React from "react";
import {
  SequenceBodyItem,
  ReadPin,
  WritePin,
} from "farmbot";
import { TaggedSequence } from "../../resources/tagged_resources";
import { editStep } from "../../api/crud";
import { maybeDetermineUuid } from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { JSXChildren } from "../../util/index";

export const EMPTY_READ_PIN: ReadPin = {
  kind: "read_pin",
  args: { pin_mode: 0, pin_number: 13, label: "" }
};

export const EMPTY_WRITE_PIN: WritePin = {
  kind: "write_pin",
  args: { pin_number: 13, pin_value: 0, pin_mode: 0 }
};

/** Generates a function that returns a redux action. */
export const changeStep =
  /** When put inside a call to `dispatch()`, transforms the provided step from
   * one `kind` to another. Ex: Turn `read_pin` to `read_peripheral`. */
  (replacement: SequenceBodyItem) =>
    (step: Readonly<SequenceBodyItem>,
      sequence: Readonly<TaggedSequence>,
      index: number) => {
      return editStep({
        step,
        sequence,
        index,
        executor(c) {
          c.kind = replacement.kind;
          c.args = replacement.args;
          c.body = replacement.body;
        }
      });
    };

export const selectedItem = (id: number, resources: ResourceIndex) => {
  const uuid = maybeDetermineUuid(resources, "Peripheral", id) || "_";
  const item = resources.references[uuid];
  if (item && item.kind === "Peripheral") {
    return { label: item.body.label, value: item.body.id || 0 };
  }
};

export const getPeripheralId = (step: SequenceBodyItem) => {
  throw new Error("TODO");
};

interface StepCheckBoxProps {
  onClick(): void;
  children?: JSXChildren;
  checked?: boolean;
}

export function StepCheckBox(props: StepCheckBoxProps) {
  return <>
    <label>{props.children}</label>
    <div className="fb-checkbox">
      <input
        type="checkbox"
        onChange={props.onClick}
        checked={!!props.checked} />
    </div>
  </>;
}
