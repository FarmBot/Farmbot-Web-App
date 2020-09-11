import React from "react";
import { McuInputBox } from "./mcu_input_box";
import { NumericMCUInputGroupProps } from "./interfaces";
import { Row, Col, Help } from "../../ui";
import { Position } from "@blueprintjs/core";
import { Highlight } from "../maybe_highlight";
import { t } from "../../i18next_wrapper";
import { getDefaultFwConfigValue } from "./default_values";

export class NumericMCUInputGroup
  extends React.Component<NumericMCUInputGroupProps> {

  Inputs = () => {
    const {
      sourceFwConfig, dispatch, intSize, gray, float, firmwareHardware,
      x, y, z, xScale, yScale, zScale, min, max, disabled, disabledBy,
    } = this.props;
    const commonProps = {
      sourceFwConfig,
      dispatch,
      firmwareHardware,
      intSize,
      float,
      min,
      max,
      disabled,
    };
    return <div className={"mcu-inputs"}>
      <Col xs={4}>
        <McuInputBox {...commonProps}
          setting={x}
          scale={xScale}
          title={gray?.x ? disabledBy : undefined}
          gray={gray?.x} />
      </Col>
      <Col xs={4}>
        <McuInputBox {...commonProps}
          setting={y}
          scale={yScale}
          title={gray?.y ? disabledBy : undefined}
          gray={gray?.y} />
      </Col>
      <Col xs={4}>
        <McuInputBox {...commonProps}
          setting={z}
          scale={zScale}
          title={gray?.z ? disabledBy : undefined}
          gray={gray?.z} />
      </Col>
    </div>;
  }

  get tooltip() {
    const getDefault = getDefaultFwConfigValue(this.props.firmwareHardware);
    const scale = {
      x: this.props.x.includes("step_per_mm") ? 1 : this.props.xScale || 1,
      y: this.props.y.includes("step_per_mm") ? 1 : this.props.yScale || 1,
      z: this.props.z.includes("step_per_mm") ? 1 : this.props.zScale || 1,
    };
    return t(this.props.tooltip, {
      x: getDefault(this.props.x) / scale.x,
      y: getDefault(this.props.y) / scale.y,
      z: getDefault(this.props.z) / scale.z,
    });
  }

  render() {
    const { label } = this.props;
    return <Highlight settingName={label}>
      <Row>
        <Col xs={12} className={"widget-body-tooltips"}>
          <label>
            {t(label)}
          </label>
          <Help text={this.tooltip} position={Position.TOP_RIGHT} />
        </Col>
      </Row>
      <Row><this.Inputs /></Row>
    </Highlight>;
  }
}
