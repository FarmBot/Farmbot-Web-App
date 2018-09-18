import { ResourceUpdate } from "farmbot";
import { editStep } from "../../../api/crud";
import { packStep } from "./pack_step";
import { MarkAsEditProps } from "./interfaces";

/** A wrapper for the `editStep()` action creator.
 * Isolated from UI for ease of testing. */
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
