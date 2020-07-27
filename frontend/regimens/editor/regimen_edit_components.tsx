import * as React from "react";
import { RegimenProps } from "../interfaces";
import { Row, Col, ColorPicker, SaveBtn } from "../../ui/index";
import { editRegimen } from "../actions";
import { t } from "../../i18next_wrapper";
import { VariableNode } from "../../sequences/locals_list/locals_list_support";
import { ScopeDeclarationBodyItem } from "farmbot";
import { defensiveClone } from "../../util";
import {
  addOrEditBodyVariables,
} from "../../sequences/locals_list/handle_select";
import { overwrite, save, destroy } from "../../api/crud";
import { CopyButton } from "./copy_button";
import { push } from "../../history";

export function RegimenNameInput({ regimen, dispatch }: RegimenProps) {
  return <Row>
    <Col xs={11}>
      <input
        placeholder={t("Regimen Name")}
        type="text"
        name="name"
        onChange={e =>
          dispatch(editRegimen(regimen, { name: e.currentTarget.value }))}
        value={regimen.body.name || ""} />
    </Col>
    <Col xs={1} className="color-picker-col">
      <RegimenColorPicker regimen={regimen} dispatch={dispatch} />
    </Col>
  </Row>;
}

export const RegimenColorPicker = ({ regimen, dispatch }: RegimenProps) =>
  <ColorPicker
    current={regimen.body.color || "gray"}
    onChange={color => dispatch(editRegimen(regimen, { color }))} />;

export const editRegimenVariables = (props: RegimenProps) =>
  (bodyVariables: VariableNode[]) =>
    (variable: ScopeDeclarationBodyItem) => {
      const copy = defensiveClone(props.regimen);
      copy.body.body = addOrEditBodyVariables(bodyVariables, variable);
      props.dispatch(overwrite(props.regimen, copy.body));
    };

export const RegimenButtonGroup = (props: RegimenProps) =>
  <div className="button-group">
    <SaveBtn
      status={props.regimen.specialStatus}
      onClick={() => props.dispatch(save(props.regimen.uuid))} />
    <CopyButton regimen={props.regimen} dispatch={props.dispatch} />
    <button className="fb-button red"
      title={t("delete regimen")}
      onClick={() => props.dispatch(destroy(props.regimen.uuid))
        .then(() => push("/app/designer/regimens/"))}>
      <i className={"fa fa-trash"} />
    </button>
  </div>;

export const OpenSchedulerButton = () =>
  <div className={"open-bulk-scheduler-btn-wrapper"}>
    <button className={"fb-button gray"}
      title={t("open scheduler panel")}
      onClick={() => push("/app/designer/regimens/scheduler")}>
      {t("Schedule item")}
    </button>
  </div>;
