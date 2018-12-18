import * as React from "react";
import { IfParams, seqDropDown, IfBlockDropDownHandler } from "./index";
import { t } from "i18next";
import { Row, Col, FBSelect } from "../../../ui/index";

export function Then(props: IfParams) {
  const { onChange, selectedItem } = IfBlockDropDownHandler(props, "_then");
  return <Row>
    <Col xs={12} md={12}>
      <h4>{t("THEN...")}</h4>
    </Col>
    <Col xs={12} md={12}>
      <label>{t("Execute Sequence")}</label>
      <FBSelect
        key={JSON.stringify(props.currentSequence)}
        allowEmpty={true}
        list={seqDropDown(props.resources)}
        placeholder="Sequence..."
        onChange={onChange}
        selectedItem={selectedItem()} />
    </Col>
  </Row>;
}
