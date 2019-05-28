import * as React from "react";
import { FBSelect, DropDownItem } from "../../ui";
import { TaggedSensor } from "farmbot";
import { SensorSelectionProps } from "./interfaces";
import { t } from "../../i18next_wrapper";

const ALL_CHOICE: DropDownItem = { label: t("All"), value: "" };

/** Select a sensor by which to filter sensor readings. */
export const SensorSelection = ({
  selectedSensor, sensors, setSensor }: SensorSelectionProps) => {
  const sensorByUuidLookup: { [x: string]: TaggedSensor } = {};
  sensors.map(x => { sensorByUuidLookup[x.uuid] = x; });

  const sensorDDIByUuidLookup: { [x: string]: DropDownItem } = {};
  sensors.map(x => {
    sensorDDIByUuidLookup[x.uuid] = { label: x.body.label, value: x.uuid };
  });
  return <div className="sensor-selection">
    <label>{t("Sensor")}</label>
    <FBSelect
      key={selectedSensor ? selectedSensor.uuid : "all_sensors"}
      selectedItem={selectedSensor
        ? sensorDDIByUuidLookup[selectedSensor.uuid]
        : ALL_CHOICE}
      onChange={ddi => setSensor(sensorByUuidLookup[ddi.value])}
      list={Object.values(sensorDDIByUuidLookup)}
      allowEmpty={true}
      customNullLabel={t("All")} />
  </div>;
};
