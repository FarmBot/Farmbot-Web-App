import { TaggedSequence } from "farmbot";
import { ResourceUpdate } from "../../../../latest_corpus";
import { editStep } from "../../../api/crud";
import { DropDownItem } from "../../../ui";
import { packStep } from "./pack_step";

export interface MarkAsEditProps {
  nextAction: DropDownItem;
  nextResource: DropDownItem | undefined;
  step: ResourceUpdate;
  index: number;
  sequence: TaggedSequence
}

export const commitStepChanges = (p: MarkAsEditProps) => {
  const { step, nextResource, nextAction, index, sequence } = p;
  return editStep({
    step,
    index,
    sequence,
    executor(c: ResourceUpdate) {
      c.args = packStep(step, nextResource, nextAction).args;
    }
  });
};
