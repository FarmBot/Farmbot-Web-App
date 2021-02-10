import { sortBy } from "lodash";
import React from "react";
import { destroy, edit, initSave, save } from "../../api/crud";
import { Content } from "../../constants";
import { t } from "../../i18next_wrapper";
import { Row, Col } from "../../ui";
import { ClearFarmwareData } from "./clear_farmware_data";
import { EnvEditorProps } from "./interfaces";

enum ColumnWidth {
  key = 7,
  value = 4,
  button = 1,
}

export const EnvEditor = (props: EnvEditorProps) => {
  const [newKey, setNewKey] = React.useState("");
  const [newValue, setNewValue] = React.useState("");
  return <div className={"farmware-env-editor"}>
    <label>{props.title || t("env editor")}</label>
    <ClearFarmwareData>{t("delete all")}</ClearFarmwareData>
    <div className={"env-editor-warning"}>
      <p>{t(Content.FARMWARE_ENV_EDITOR_WARNING)}</p>
    </div>
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
    {sortBy(props.farmwareEnvs, "body.id").reverse().map(farmwareEnv =>
      <Row key={farmwareEnv.uuid}>
        <Col xs={ColumnWidth.key}>
          <input value={farmwareEnv.body.key}
            onChange={e =>
              props.dispatch(edit(farmwareEnv, { key: e.currentTarget.value }))}
            onBlur={() => props.dispatch(save(farmwareEnv.uuid))} />
        </Col>
        <Col xs={ColumnWidth.value}>
          <input value={"" + farmwareEnv.body.value}
            onChange={e =>
              props.dispatch(edit(farmwareEnv, { value: e.currentTarget.value }))}
            onBlur={() => props.dispatch(save(farmwareEnv.uuid))} />
        </Col>
        <Col xs={ColumnWidth.button}>
          <button
            className={"fb-button red"}
            title={t("delete")}
            onClick={() => props.dispatch(destroy(farmwareEnv.uuid))}>
            <i className={"fa fa-times"} />
          </button>
        </Col>
      </Row>)}
  </div>;
};
