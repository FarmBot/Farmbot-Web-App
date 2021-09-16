import { If } from "farmbot";
import { DropDownItem } from "../../../ui";
import { ResourceIndex } from "../../../resources/interfaces";
import { findUuid } from "../../../resources/selectors";
import { isString } from "lodash";

export interface DisplayLhsProps {
  currentStep: If;
  resources: ResourceIndex;
  lhsOptions: DropDownItem[];
}

export function displayLhs(props: DisplayLhsProps): DropDownItem | undefined {
  const { lhs } = props.currentStep.args;
  if (isString(lhs)) {
    return props.lhsOptions.filter(ddi => ddi.value === lhs)[0];
  } else {
    const { pin_id, pin_type } = lhs.args;
    switch (pin_type) {
      case "Sensor":
      case "Peripheral":
        const uuid = findUuid(props.resources, pin_type, pin_id);
        return props.lhsOptions.filter(ddi => ddi.value === uuid)[0];
    }

  }
}
