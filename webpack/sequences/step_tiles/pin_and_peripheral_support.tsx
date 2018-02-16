import * as React from "react";
import { ReadPeripheral, SequenceBodyItem, ReadPin } from "farmbot";
import { TaggedSequence } from "../../resources/tagged_resources";
import { editStep } from "../../api/crud";
import { StepParams } from "../interfaces";
import { DropDownItem, FBSelect } from "../../ui/index";
import { selectAllPeripherals, maybeDetermineUuid } from "../../resources/selectors";
import { isNumber } from "lodash";
import { WritePeripheral } from "../../../latest_corpus";
import { ResourceIndex } from "../../resources/interfaces";
import { t } from "i18next";
import { JSXChildren } from "../../util/index";

export const EMPTY_READ_PIN: ReadPin = {
  kind: "read_pin",
  args: { pin_mode: 0, pin_number: 13, label: "" }
};

export const EMPTY_READ_PERIPHERAL: ReadPeripheral = {
  kind: "read_peripheral",
  args: { peripheral_id: 0, pin_mode: 0 }
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

const selectedItem = (id: number, resources: ResourceIndex) => {
  const uuid = maybeDetermineUuid(resources, "Peripheral", id) || "_";
  const item = resources.references[uuid];
  if (item && item.kind === "Peripheral") {
    return { label: item.body.label, value: item.body.id || 0 };
  }
};

export function PeripheralSelector(props: StepParams) {
  const { currentStep, currentSequence, index, dispatch } = props;
  const peripherals: DropDownItem[] = selectAllPeripherals(props.resources)
    .map(x => {
      const label = x.body.label;
      const value = x.body.id || 0;
      return { label, value };
    })
    .filter(x => x.value);
  if (currentStep.kind !== "read_peripheral") {
    throw new Error("Expected `read_peripheral`");
  }
  return <>
    <label>{t("Peripheral")} </label>
    <FBSelect
      allowEmpty={false}
      list={peripherals}
      placeholder="Select a peripheral..."
      onChange={(selection) => {
        dispatch(editStep({
          sequence: currentSequence,
          step: currentStep,
          index: index,
          executor: (step: ReadPeripheral | WritePeripheral) => {
            if (isNumber(selection.value)) {
              step.args.peripheral_id = selection.value;
            } else {
              throw new Error("selection.value must be numeric");
            }
          }
        }));
      }
      }
      selectedItem={selectedItem(currentStep.args.peripheral_id, props.resources)} />
    </>;
}

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
