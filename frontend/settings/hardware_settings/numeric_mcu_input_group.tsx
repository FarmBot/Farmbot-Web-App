import * as React from "react";
import { McuInputBox } from "./mcu_input_box";
import { NumericMCUInputGroupProps } from "./interfaces";
import { Row, Col, Help } from "../../ui";
import { Position } from "@blueprintjs/core";
import { Highlight } from "../maybe_highlight";
import { t } from "../../i18next_wrapper";

export class NumericMCUInputGroup
  extends React.Component<NumericMCUInputGroupProps> {

  Inputs = () => {
    const {
      sourceFwConfig, dispatch, intSize, gray, float,
      x, y, z, xScale, yScale, zScale, min, max, disabled, disabledBy,
    } = this.props;
    return <div className={"mcu-inputs"}>
      <Col xs={4}>
        <McuInputBox
          setting={x}
          sourceFwConfig={sourceFwConfig}
          dispatch={dispatch}
          intSize={intSize}
          float={float}
          scale={xScale}
          min={min}
          max={max}
          disabled={disabled}
          title={gray?.x ? disabledBy : undefined}
          gray={gray?.x} />
      </Col>
      <Col xs={4}>
        <McuInputBox
          setting={y}
          sourceFwConfig={sourceFwConfig}
          dispatch={dispatch}
          intSize={intSize}
          float={float}
          scale={yScale}
          min={min}
          max={max}
          disabled={disabled}
          title={gray?.y ? disabledBy : undefined}
          gray={gray?.y} />
      </Col>
      <Col xs={4}>
        <McuInputBox
          setting={z}
          sourceFwConfig={sourceFwConfig}
          dispatch={dispatch}
          intSize={intSize}
          float={float}
          scale={zScale}
          min={min}
          max={max}
          disabled={disabled}
          title={gray?.z ? disabledBy : undefined}
          gray={gray?.z} />
      </Col>
    </div>;
  }

  render() {
    const { tooltip, label } = this.props;
    return <Highlight settingName={label}>
      <Row>
        <Col xs={12} className={"widget-body-tooltips"}>
          <label>
            {t(label)}
          </label>
          <Help text={tooltip} position={Position.TOP_RIGHT} />
        </Col>
      </Row>
      <Row><this.Inputs /></Row>
    </Highlight>;
  }
}
