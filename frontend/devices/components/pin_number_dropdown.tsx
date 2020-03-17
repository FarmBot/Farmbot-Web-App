import * as React from "react";
import { FBSelect, DropDownItem } from "../../ui/index";
import { updateMCU } from "../actions";
import { isNumber } from "lodash";
import { t } from "../../i18next_wrapper";
import {
  pinDropdowns, celery2DropDown, PinGroupName, PERIPHERAL_HEADING,
} from "../../sequences/step_tiles/pin_and_peripheral_support";
import {
  selectAllPeripherals, selectAllSavedPeripherals,
} from "../../resources/selectors";
import { Dictionary, NamedPin, McuParamName } from "farmbot";
import { ResourceIndex } from "../../resources/interfaces";
import { NumberConfigKey } from "farmbot/dist/resources/configs/firmware";
import { SourceFwConfig } from "../interfaces";

interface PinNumberDropdownProps {
  sourceFwConfig: SourceFwConfig;
  dispatch: Function;
  pinNumKey: McuParamName;
  resources: ResourceIndex;
}

/**
 * Dropdown of pin numbers values. Includes peripheral pin numbers.
 * Will show the peripheral name of a pin if the pin number value matches.
 */
export const PinNumberDropdown = (props: PinNumberDropdownProps) => {
  const { pinNumKey, resources, dispatch } = props;
  const pinNumberValue = props.sourceFwConfig(pinNumKey).value || 0;
  const peripheralIds = peripheralDictionary(resources);
  const pinNumberNode = pinNumOrNamedPin(pinNumberValue, peripheralIds);
  return <FBSelect
    extraClass={props.sourceFwConfig(pinNumKey).consistent ? "" : "dim"}
    selectedItem={pinNumberValue
      ? celery2DropDown(pinNumberNode, resources)
      : undefined}
    customNullLabel={t("Select a pin")}
    onChange={onChange({ dispatch, oldValue: pinNumberValue, pinNumKey })}
    list={listItems(resources)} />;
};

const peripheralDictionary = (resources: ResourceIndex): Dictionary<number> => {
  const peripheralIds: Dictionary<number> = {};
  selectAllPeripherals(resources).map(p =>
    (p.body.pin && p.body.id) && (peripheralIds[p.body.pin] = p.body.id));
  return peripheralIds;
};

const pinNumOrNamedPin =
  (pin: number, lookup: Dictionary<number>): NamedPin | number =>
    lookup[pin]
      ? {
        kind: "named_pin",
        args: { pin_type: "Peripheral", pin_id: lookup[pin] }
      }
      : pin;

const DISABLE_DDI = (): DropDownItem => ({
  label: t("None"), value: 0
});

const listItems = (resources: ResourceIndex): DropDownItem[] =>
  [DISABLE_DDI(), ...peripheralItems(resources), ...pinDropdowns(n => n)];

const peripheralItems = (resources: ResourceIndex): DropDownItem[] => {
  const list = selectAllSavedPeripherals(resources)
    .filter(peripheral => isNumber(peripheral.body.pin))
    .map(peripheral => ({
      label: peripheral.body.label,
      value: "" + peripheral.body.pin,
      headingId: PinGroupName.Peripheral
    }));
  return list.length ? [PERIPHERAL_HEADING(), ...list] : [];
};

interface OnChangeProps {
  dispatch: Function;
  oldValue: number;
  pinNumKey: NumberConfigKey;
}

const onChange = (props: OnChangeProps) => (ddi: DropDownItem) => {
  const { oldValue, pinNumKey } = props;
  const newValue = parseInt("" + ddi.value);
  (isFinite(newValue) && (newValue !== oldValue)) &&
    props.dispatch(updateMCU(pinNumKey, "" + newValue));
};
