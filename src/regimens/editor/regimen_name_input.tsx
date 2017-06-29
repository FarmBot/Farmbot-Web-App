import * as React from "react";
import { RegimenProps } from "../interfaces";
import { t } from "i18next";
import { ColorPicker } from "../../sequences/color_picker";
import { Row, Col } from "../../ui/index";
import { editRegimen } from "../actions";

function write({ dispatch, regimen }: RegimenProps):
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
  let value = (regimen && regimen.body.name) || "";
  return <Row>
    <Col xs={10}>
      <input id="right-label"
        placeholder={t("Regimen Name")}
        type="text"
        onChange={write({ dispatch, regimen })}
        value={value} />
    </Col>
    <ColorPicker current={(regimen && regimen.body.color) || "gray"}
      onChange={(color) => dispatch(editRegimen(regimen, { color }))} />
  </Row>;
}
