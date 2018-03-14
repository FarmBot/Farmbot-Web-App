import { TaggedSequence } from "../../../resources/tagged_resources";
import { If } from "farmbot";
import { ResourceIndex } from "../../../resources/interfaces";
import { defensiveClone, fancyDebug } from "../../../util";
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
    const { currentStep, currentSequence, dispatch, index } = props;
    return (e: DropDownItem) => {
      fancyDebug(e);
      const stepCopy = defensiveClone(currentStep);
      const seqCopy = defensiveClone(currentSequence).body;
      const val = e.value;
      seqCopy.body = seqCopy.body || [];
      if (isString(val)) {
        switch (e.headingId) {
          case PinGroupName.Peripheral:
            throw new Error("Implement peripherals");
          case PinGroupName.Sensor:
            throw new Error("Implement sensors");
          case PinGroupName.Pin:
            stepCopy.args.lhs = val;
            break;
          default:
            throw new Error("Unhandled heading ID: " + e.headingId);
        }
      }
      seqCopy.body[index] = stepCopy;
      dispatch(overwrite(currentSequence, seqCopy));
    };
  };
