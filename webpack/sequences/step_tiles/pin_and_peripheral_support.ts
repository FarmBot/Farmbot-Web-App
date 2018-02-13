import { ReadPeripheral, SequenceBodyItem, ReadPin } from "farmbot";
import { TaggedSequence } from "../../resources/tagged_resources";
import { editStep } from "../../api/crud";

export const EMPTY_READ_PIN: ReadPin = {
  kind: "read_pin",
  args: { pin_mode: 0, pin_number: 13, label: "" }
};

export const EMPTY_READ_PERIPHERAL: ReadPeripheral = {
  kind: "read_peripheral",
  args: { peripheral_id: 0, pin_mode: 0 }
};

export const changeStep =
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
