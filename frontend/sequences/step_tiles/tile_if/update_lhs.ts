import { TaggedSequence, If } from "farmbot";
import { ResourceIndex } from "../../../resources/interfaces";
import { defensiveClone } from "../../../util";
import { DropDownItem } from "../../../ui";
import { overwrite } from "../../../api/crud";
import { PinGroupName } from "../pin_support";

export interface LhsUpdateProps {
  currentSequence: TaggedSequence;
  currentStep: If;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
}

export const updateLhs =
  (props: LhsUpdateProps) => {
    const { currentStep, currentSequence, dispatch, index, resources } = props;
    return (ddi: DropDownItem) => {
      const stepCopy = defensiveClone(currentStep);
      const seqCopy = defensiveClone(currentSequence).body;
      seqCopy.body = seqCopy.body || [];
      switch (ddi.headingId) {
        case PinGroupName.Peripheral:
        case PinGroupName.Sensor:
          const resource = resources.references[ddi.value];
          switch (resource?.kind) {
            case "Peripheral":
            case "Sensor":
              stepCopy.args.lhs = {
                kind: "named_pin",
                args: {
                  pin_type: resource.kind,
                  pin_id: resource.body.id || 0
                }
              };
          }
          break;
        case PinGroupName.Position: // "x", "y", "z"
        case PinGroupName.Pin: // "pin0", "pin1", ...
          stepCopy.args.lhs = "" + ddi.value;
          break;
        default:
          throw new Error(`Unhandled LHS item: ${ddi.headingId} ${ddi.value}`);
      }
      seqCopy.body[index] = stepCopy;
      dispatch(overwrite(currentSequence, seqCopy));
    };
  };
