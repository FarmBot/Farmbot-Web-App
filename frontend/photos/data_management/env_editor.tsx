import React from "react";
import { t } from "../../i18next_wrapper";
import { TaggedFarmwareEnv } from "farmbot";
import { some, sortBy } from "lodash";
import { destroy, edit, initSave, save } from "../../api/crud";
import { Content } from "../../constants";
import { DevSettings } from "../../settings/dev/dev_support";
import { error } from "../../toast/toast";
import { Row, Col, Help } from "../../ui";
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
  return <div className={"farmware-env-editor"}>
    <label>{props.title}</label>
    {props.title && <Help text={Content.FARMWARE_ENV_EDITOR_INFO} />}
    <Row className={"no-margin"} />
    <Row>
      <Col xs={ColumnWidth.key}>
        <input
          value={newKey}
          placeholder={t("Setting name (key)")}
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
            if (props.farmwareEnvs.map(x => x.body.key).includes(newKey)) {
              return error(t("Key has already been taken."));
            }
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
      .filter(farmwareEnv => !some(HIDDEN_PREFIXES.map(prefix =>
        farmwareEnv.body.key.startsWith(prefix))))
      .map(farmwareEnv =>
        <FarmwareEnvRow key={farmwareEnv.uuid + farmwareEnv.body.value}
          dispatch={props.dispatch} farmwareEnv={farmwareEnv} />)}
    {DevSettings.showInternalEnvsEnabled() && <label>{t("internal envs")}</label>}
    {DevSettings.showInternalEnvsEnabled() &&
      <ClearFarmwareData farmwareEnvs={props.farmwareEnvs}>
        {t("delete all")}
      </ClearFarmwareData>}
    {DevSettings.showInternalEnvsEnabled() &&
      <div className={"env-editor-warning"}>
        <p>{t(Content.FARMWARE_ENV_EDITOR_WARNING)}</p>
      </div>}
    {DevSettings.showInternalEnvsEnabled() &&
      sortBy(props.farmwareEnvs, "body.id").reverse()
        .filter(farmwareEnv => some(HIDDEN_PREFIXES.map(prefix =>
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
