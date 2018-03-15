import { NULL_CHOICE, DropDownItem } from "../../../ui/index";
import { ResourceIndex } from "../../../resources/interfaces";
import { If } from "farmbot";
import { isString } from "util";
import { findByKindAndId } from "../../../resources/selectors";

interface DisplayLhsProps {
  currentStep: If;
  resources: ResourceIndex;
  lhsOptions: DropDownItem[];
}

const findDropdownByValue = (needle: string, haystack: DropDownItem[]) =>
  haystack.filter(x => x.value === needle)[0] || NULL_CHOICE;

export function displayLhs(props: DisplayLhsProps): DropDownItem {
  const { lhs } = props.currentStep.args;
  const { lhsOptions } = props;
  if (isString(lhs)) {
    return findDropdownByValue(lhs, lhsOptions);
  } else {
    const { pin_id, pin_type } = lhs.args;
    const kind = pin_type as "Peripheral" | "Sensor"; // :(
    const id = pin_id || -1;
    const { uuid } = findByKindAndId(props.resources, kind, id);
    return findDropdownByValue(uuid, lhsOptions);
  }
}
