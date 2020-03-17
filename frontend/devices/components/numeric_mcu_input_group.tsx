import * as React from "react";
import { McuInputBox } from "./mcu_input_box";
import { NumericMCUInputGroupProps } from "./interfaces";
import { Row, Col, Help } from "../../ui/index";
import { Position } from "@blueprintjs/core";
import { Highlight } from "./maybe_highlight";
import { t } from "../../i18next_wrapper";
import { DevSettings } from "../../account/dev/dev_support";

export class NumericMCUInputGroup
  extends React.Component<NumericMCUInputGroupProps> {

  get newFormat() { return DevSettings.futureFeaturesEnabled(); }

  Inputs = () => {
    const {
      sourceFwConfig, dispatch, intSize, gray, float,
      x, y, z, xScale, yScale, zScale,
    } = this.props;
    return <div className={"mcu-inputs"}>
      <Col xs={this.newFormat ? 4 : 2}>
        <McuInputBox
          setting={x}
          sourceFwConfig={sourceFwConfig}
          dispatch={dispatch}
          intSize={intSize}
          float={float}
          scale={xScale}
          gray={gray?.x} />
      </Col>
      <Col xs={this.newFormat ? 4 : 2}>
        <McuInputBox
          setting={y}
          sourceFwConfig={sourceFwConfig}
          dispatch={dispatch}
          intSize={intSize}
          float={float}
          scale={yScale}
          gray={gray?.y} />
      </Col>
      <Col xs={this.newFormat ? 4 : 2}>
        <McuInputBox
          setting={z}
          sourceFwConfig={sourceFwConfig}
          dispatch={dispatch}
          intSize={intSize}
          float={float}
          scale={zScale}
          gray={gray?.z} />
      </Col>
    </div>;
  }

  render() {
    const { tooltip, label } = this.props;
    return <Highlight settingName={label}>
      <Row>
        <Col xs={this.newFormat ? 12 : 6} className={"widget-body-tooltips"}>
          <label>
            {t(label)}
          </label>
          <Help text={tooltip} position={Position.TOP_RIGHT} />
        </Col>
        {!this.newFormat && <this.Inputs />}
      </Row>
      {this.newFormat && <Row><this.Inputs /></Row>}
    </Highlight>;
  }
}
