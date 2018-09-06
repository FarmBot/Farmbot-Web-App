import * as React from "react";
import { t } from "i18next";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect } from "../../ui/index";
import {
  setNoun,
  adjectiveList,
  setAdjective,
  getNounList,
} from "./mark_as/options";
import { MarkAsSelection } from "./mark_as/interfaces";
import { NONE_SELECTED } from "./mark_as/constants";
import { betterCompact } from "../../util";

export class MarkAs extends React.Component<StepParams, MarkAsSelection> {
  state: MarkAsSelection = NONE_SELECTED;
  className = "wait-step";

  nothing = () => {
    return <Col xs={4}>
    </Col>;
  }

  adjective = () => {
    return <Col xs={4}>
      <label>{t("As " + this.state.adjective.label)}</label>
      <FBSelect
        key={"hmmm" + this.props.index}
        list={betterCompact(adjectiveList(this.state))}
        onChange={setAdjective((x: MarkAsSelection) => this.setState(x))}
        selectedItem={this.state.adjective} />
    </Col>;
  }

  render() {
    const setState = (x: MarkAsSelection) => this.setState(x);
    return <StepWrapper>
      <StepHeader
        className={this.className}
        helpText={ToolTips.WAIT}
        currentSequence={this.props.currentSequence}
        currentStep={this.props.currentStep}
        dispatch={this.props.dispatch}
        index={this.props.index}
        confirmStepDeletion={this.props.confirmStepDeletion} />
      <StepContent className={this.className}>
        <Row>
          <Col xs={8}>
            <label>{t("Mark")}</label>
            <FBSelect
              list={getNounList(this.props.resources)}
              onChange={setNoun(setState)}
              allowEmpty={false}
              selectedItem={this.state.noun} />
          </Col>
          {this.state.kind == "NoneSelected" ? <this.nothing /> : <this.adjective />}
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
