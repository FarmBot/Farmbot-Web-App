import { betterCompact } from "../../util";
import { Row, Col, FBSelect } from "../../ui/index";
import { StepParams } from "../interfaces";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import * as React from "react";

export class MarkAs extends React.Component<StepParams, MarkAsSelection> {
  state: MarkAsSelection = NONE_SELECTED;
  className = "wait-step";
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
          <Col xs={4}>
            <label>{t("as")}</label>
            <FBSelect
              key={this.state.adjective.label}
              list={betterCompact(adjectiveList(this.state))}
              onChange={setAdjective((x: MarkAsSelection) => this.setState(x))}
              selectedItem={this.state.adjective} />
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
