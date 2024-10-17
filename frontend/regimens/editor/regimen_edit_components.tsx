import React from "react";
import { RegimenProps } from "../interfaces";
import { SaveBtn, Popover, ColorPickerCluster } from "../../ui";
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
import { Path } from "../../internal_urls";
import { Position } from "@blueprintjs/core";
import { edit } from "../../api/crud";

export const editRegimenVariables = (props: RegimenProps) =>
  (bodyVariables: VariableNode[]) =>
    (variable: ScopeDeclarationBodyItem) => {
      const copy = defensiveClone(props.regimen);
      copy.body.body = addOrEditBodyVariables(
        bodyVariables, variable, variable.args.label);
      props.dispatch(overwrite(props.regimen, copy.body));
    };

export const RegimenButtonGroup = (props: RegimenProps) => {
  const { regimen, dispatch } = props;
  return <div className="button-group">
    <SaveBtn
      status={regimen.specialStatus}
      onClick={() => dispatch(save(regimen.uuid))} />
    <CopyButton regimen={regimen} dispatch={dispatch} />
    <i className={"fa fa-trash fb-icon-button"}
      title={t("delete regimen")}
      onClick={() => dispatch(destroy(regimen.uuid))
        .then(() => push(Path.regimens()))} />
    <Popover className={"color-picker"}
      position={Position.BOTTOM}
      popoverClassName={"colorpicker-menu gray"}
      target={<i title={t("select color")}
        className={"fa fa-paint-brush fb-icon-button"} />}
      content={<ColorPickerCluster
        onChange={color => props.dispatch(edit(regimen, { color }))}
        current={regimen.body.color} />} />
  </div>;
};

export const OpenSchedulerButton = () =>
  <button className={"fb-button gray schedule-regimen-item"}
    title={t("open scheduler panel")}
    onClick={() => push(Path.regimens("scheduler"))}>
    {t("Schedule item")}
  </button>;
