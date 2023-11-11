import React from "react";
import { t } from "../../i18next_wrapper";
import { FBSelect, DropDownItem, Row, Col } from "../../ui";
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
  return <div className={"firmware-path-selection"}>
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
      <div className={"manual-selection"}>
        <p>{t("Look for the 'Available UART devices' log message.")}</p>
        <Col xs={7}>
          <input type={"text"}
            value={manualInput}
            onChange={e => setManualInput(e.currentTarget.value)} />
        </Col>
        <Col xs={5}>
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
        </Col>
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
    <Row>
      <Col xs={4}>
        <label>
          {t("Firmware path")}
        </label>
      </Col>
      <Col xs={3}>
        <code>{props.firmwarePath || t("not set")}</code>
      </Col>
      <Col xs={5} className={"no-pad"}>
        <ChangeFirmwarePath
          dispatch={props.dispatch}
          firmwarePath={props.firmwarePath} />
      </Col>
    </Row>
  </Highlight>;
