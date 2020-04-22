import { UpdateResource } from "farmbot";
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
    executor(c: UpdateResource) {
      const { args, body } = packStep(step, nextResource, nextAction);
      c.args = args;
      c.body = body;
    }
  });
};
