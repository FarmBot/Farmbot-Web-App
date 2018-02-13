export const EMPTY_READ_PERIPHERAL: ReadPeripheral = {
  kind: "read_peripheral",
  args: { peripheral_id: 0 }
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
