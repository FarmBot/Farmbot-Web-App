import * as React from "react";
import { FBSelect, DropDownItem } from "../../ui";
import { t } from "i18next";
import { TaggedSensor } from "../../resources/tagged_resources";

const ALL_CHOICE: DropDownItem = { label: t("All"), value: "" };

export interface SensorSelectionProps {
  selectedSensor: TaggedSensor | undefined;
  sensors: TaggedSensor[];
  setSensor: (sensor: TaggedSensor) => void;
}

/** Select a sensor by which to filter sensor readings. */
export const SensorSelection = ({
  selectedSensor, sensors, setSensor }: SensorSelectionProps) => {
  const sensorByUuidLookup: { [x: string]: TaggedSensor } = {};
  sensors.map(x => { sensorByUuidLookup[x.uuid] = x; });

  const sensorDDIByUuidLookup: { [x: string]: DropDownItem } = {};
  sensors.map(x => {
    sensorDDIByUuidLookup[x.uuid] = { label: x.body.label, value: x.uuid };
  });
  return <div>
    <label>{t("Sensor")}</label>
    <FBSelect
      selectedItem={selectedSensor
        ? sensorDDIByUuidLookup[selectedSensor.uuid]
        : ALL_CHOICE}
      onChange={ddi => setSensor(sensorByUuidLookup[ddi.value])}
      list={Object.values(sensorDDIByUuidLookup)}
      allowEmpty={true}
      customNullLabel={t("All")} />
  </div>;
};
