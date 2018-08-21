import { TaggedSequence, If } from "farmbot";
import { ResourceIndex } from "../../../resources/interfaces";
import { defensiveClone, bail } from "../../../util";
import { DropDownItem } from "../../../ui";
import { overwrite } from "../../../api/crud";
import { isString } from "lodash";
import { PinGroupName } from "../pin_and_peripheral_support";

interface LhsUpdateProps {
  currentSequence: TaggedSequence;
  currentStep: If;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
}

export const updateLhs =
  (props: LhsUpdateProps) => {
    const { currentStep, currentSequence, dispatch, index, resources } = props;
    return (e: DropDownItem) => {
      const stepCopy = defensiveClone(currentStep);
      const seqCopy = defensiveClone(currentSequence).body;
      const val = e.value;
      seqCopy.body = seqCopy.body || [];
      if (isString(val)) {
        switch (e.headingId) {
          case PinGroupName.Peripheral:
          case PinGroupName.Sensor:
            const resource = resources.references[e.value];
            if (!resource) { return bail("NO"); }
            stepCopy.args.lhs = {
              kind: "named_pin",
              args: { pin_type: resource.kind, pin_id: resource.body.id || 0 }
            };
            break;
          case PinGroupName.Position: // "x", "y", "z"
          case PinGroupName.Pin:      // "pin0", "pin2"
            stepCopy.args.lhs = val;
            break;
          default:
            throw new Error(`Unhandled LHS item: ${e.headingId} ${e.value}`);
        }
      }
      seqCopy.body[index] = stepCopy;
      dispatch(overwrite(currentSequence, seqCopy));
    };
  };
