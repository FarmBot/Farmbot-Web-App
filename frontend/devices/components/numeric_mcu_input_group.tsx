import * as React from "react";
import { McuInputBox } from "./mcu_input_box";
import { NumericMCUInputGroupProps } from "./interfaces";
import { Row, Col, Help } from "../../ui/index";
import { Position } from "@blueprintjs/core";

export function NumericMCUInputGroup(props: NumericMCUInputGroupProps) {

  const {
    sourceFwConfig, dispatch, tooltip, name, x, y, z, intSize, gray, float,
  } = props;
  return <Row>
    <Col xs={6} className={"widget-body-tooltips"}>
      <label>
        {name}
      </label>
      <Help text={tooltip} requireClick={true} position={Position.RIGHT}/>
    </Col>
    <Col xs={2}>
      <McuInputBox
        setting={x}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch}
        intSize={intSize}
        float={float}
        scale={props.xScale}
        gray={gray && gray.x} />
    </Col>
    <Col xs={2}>
      <McuInputBox
        setting={y}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch}
        intSize={intSize}
        float={float}
        scale={props.yScale}
        gray={gray && gray.y} />
    </Col>
    <Col xs={2}>
      <McuInputBox
        setting={z}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch}
        intSize={intSize}
        float={float}
        scale={props.zScale}
        gray={gray && gray.z} />
    </Col>
  </Row>;
}
