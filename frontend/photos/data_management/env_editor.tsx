import { TaggedFarmwareEnv } from "farmbot";
import { some, sortBy } from "lodash";
import React from "react";
import { destroy, edit, initSave, save } from "../../api/crud";
import { Content } from "../../constants";
import { t } from "../../i18next_wrapper";
import { error } from "../../toast/toast";
import { Row, Col, ToggleButton, Help } from "../../ui";
import { ClearFarmwareData } from "./clear_farmware_data";
import { EnvEditorProps } from "./interfaces";

enum ColumnWidth {
  key = 7,
  value = 4,
  button = 1,
}

const HIDDEN_PREFIXES = [
  "LAST_CLIENT_CONNECTED",
  "camera",
  "take_photo",
  "WEED_DETECTOR",
  "CAMERA_CALIBRATION",
  "measure_soil_height",
  "interpolation_",
];

export const EnvEditor = (props: EnvEditorProps) => {
  const [newKey, setNewKey] = React.useState("");
  const [newValue, setNewValue] = React.useState("");
  const [hidden, setHidden] = React.useState(true);
  return <div className={"farmware-env-editor"}>
    <label>{props.title || t("env editor")}</label>
    <Help text={Content.FARMWARE_ENV_EDITOR_INFO} />
    <ClearFarmwareData farmwareEnvs={props.farmwareEnvs}>
      {t("delete all")}
    </ClearFarmwareData>
    <div className={"env-hide-toggle"}>
      <label>{t("hide internal envs")}</label>
      <ToggleButton toggleValue={hidden} toggleAction={() => setHidden(!hidden)} />
    </div>
    {!hidden &&
      <div className={"env-editor-warning"}>
        <p>{t(Content.FARMWARE_ENV_EDITOR_WARNING)}</p>
      </div>}
    <Row>
      <Col xs={ColumnWidth.key}>
        <input
          value={newKey}
          placeholder={t("key")}
          onChange={e => setNewKey(e.currentTarget.value)} />
      </Col>
      <Col xs={ColumnWidth.value}>
        <input value={newValue}
          placeholder={t("value")}
          onChange={e => setNewValue(e.currentTarget.value)} />
      </Col>
      <Col xs={ColumnWidth.button}>
        <button
          className={"fb-button green"}
          title={t("add")}
          onClick={() => {
            if (!newKey) { return error(t("Key cannot be blank.")); }
            props.dispatch(initSave("FarmwareEnv",
              { key: newKey, value: newValue }));
            setNewKey("");
            setNewValue("");
          }}>
          <i className={"fa fa-plus"} />
        </button>
      </Col>
    </Row>
    <hr />
    {sortBy(props.farmwareEnvs, "body.id").reverse()
      .filter(farmwareEnv => !hidden || !some(HIDDEN_PREFIXES.map(prefix =>
        farmwareEnv.body.key.startsWith(prefix))))
      .map(farmwareEnv =>
        <FarmwareEnvRow key={farmwareEnv.uuid + farmwareEnv.body.value}
          dispatch={props.dispatch} farmwareEnv={farmwareEnv} />)}
  </div>;
};

interface FarmwareEnvRowProps {
  dispatch: Function;
  farmwareEnv: TaggedFarmwareEnv;
}

const FarmwareEnvRow = (props: FarmwareEnvRowProps) => {
  const { dispatch, farmwareEnv } = props;
  const [key, setKey] = React.useState(farmwareEnv.body.key);
  const [value, setValue] = React.useState("" + farmwareEnv.body.value);
  return <Row>
    <Col xs={ColumnWidth.key}>
      <input value={key}
        onChange={e => setKey(e.currentTarget.value)}
        onBlur={() => {
          dispatch(edit(farmwareEnv, { key }));
          dispatch(save(farmwareEnv.uuid));
        }} />
    </Col>
    <Col xs={ColumnWidth.value}>
      <input value={value}
        onChange={e => setValue(e.currentTarget.value)}
        onBlur={() => {
          dispatch(edit(farmwareEnv, { value }));
          dispatch(save(farmwareEnv.uuid));
        }} />
    </Col>
    <Col xs={ColumnWidth.button}>
      <button
        className={"fb-button red"}
        title={t("delete")}
        onClick={() => dispatch(destroy(farmwareEnv.uuid))}>
        <i className={"fa fa-times"} />
      </button>
    </Col>
  </Row>;
};
