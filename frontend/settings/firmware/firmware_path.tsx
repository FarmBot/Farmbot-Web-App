import React from "react";
import { t } from "../../i18next_wrapper";
import { FBSelect, DropDownItem, Row } from "../../ui";
import { updateConfig } from "../../devices/actions";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../constants";

export interface ChangeFirmwarePathProps {
  dispatch: Function;
  firmwarePath: string;
}

export const ChangeFirmwarePath = (props: ChangeFirmwarePathProps) => {
  const OPTIONS: Record<string, DropDownItem> = {
    "": { label: t("Change firmware path to..."), value: "" },
    ttyACM0: { label: t("ttyACM0 (recommended for Genesis)"), value: "ttyACM0" },
    ttyAMA0: {
      label: t("ttyAMA0 (recommended for Express v1.0)"), value: "ttyAMA0",
    },
    ttyUSB0: {
      label: t("ttyUSB0 (recommended for Express v1.1+)"), value: "ttyUSB0",
    },
    manual: { label: t("Manual input"), value: "manual" },
  };
  const [selection, setSelection] = React.useState("");
  // fuzz key to reset dropdown after each use, even if value doesn't change
  const [fuzz, setFuzz] = React.useState(0);
  const [manualInput, setManualInput] = React.useState("");
  const submit = (value: string) =>
    value && props.dispatch(updateConfig({ firmware_path: value }));
  return <div className={"grid"}>
    <FBSelect
      key={selection + props.firmwarePath + fuzz}
      selectedItem={OPTIONS[selection]}
      onChange={ddi => {
        ddi.value != "manual" && submit("" + ddi.value);
        setSelection(ddi.value == "manual" ? "manual" : "");
        setFuzz(fuzz + 1);
      }}
      list={Object.values(OPTIONS).filter(ddi => ddi.value)} />
    {selection == "manual" &&
      <div className={"grid"}>
        <p>{t("Look for the 'Available UART devices' log message.")}</p>
        <input type={"text"}
          value={manualInput}
          onChange={e => setManualInput(e.currentTarget.value)} />
        <button
          className={"fb-button green"}
          onClick={() => {
            submit(manualInput);
            setManualInput("");
          }}
          title={t("submit")}
          disabled={!manualInput}>
          {t("submit")}
        </button>
      </div>}
  </div>;
};

export interface FirmwarePathRowProps {
  dispatch: Function;
  firmwarePath: string;
  showAdvanced: boolean;
}

export const FirmwarePathRow = (props: FirmwarePathRowProps) =>
  <Highlight settingName={DeviceSetting.firmwarePath}
    hidden={!props.showAdvanced}
    className={"advanced"}>
    <Row className="grid-2-col align-baseline">
      <div className="row grid-exp-1">
        <label>
          {t("Firmware path")}
        </label>
        <code>{props.firmwarePath || t("not set")}</code>
      </div>
      <ChangeFirmwarePath
        dispatch={props.dispatch}
        firmwarePath={props.firmwarePath} />
    </Row>
  </Highlight>;
