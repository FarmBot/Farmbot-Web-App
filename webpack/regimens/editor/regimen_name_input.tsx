import * as React from "react";
import { RegimenProps } from "../interfaces";
import { t } from "i18next";
import { Row, Col, ColorPicker } from "../../ui/index";
import { editRegimen } from "../actions";

export function write({ dispatch, regimen }: RegimenProps):
  React.EventHandler<React.FormEvent<{}>> {
  if (regimen) {
    return (event: React.FormEvent<HTMLInputElement>) => {
      dispatch(editRegimen(regimen, { name: event.currentTarget.value }));
    };
  } else {
    throw new Error("Regimen is required");
  }
}

export function RegimenNameInput({ regimen, dispatch }: RegimenProps) {
  const value = (regimen && regimen.body.name) || "";
  return <Row>
    <Col xs={11}>
      <input
        placeholder={t("Regimen Name")}
        type="text"
        onChange={write({ dispatch, regimen })}
        value={value} />
    </Col>
    <Col xs={1} className="color-picker-col">
      <ColorPicker
        current={(regimen && regimen.body.color) || "gray"}
        onChange={(color) => dispatch(editRegimen(regimen, { color }))} />
    </Col>
  </Row>;
}
