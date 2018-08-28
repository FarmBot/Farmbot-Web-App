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
} from "./mark_as/options";
import { MarkAsSelection } from "./mark_as/interfaces";
import { NOUNS, NONE_SELECTED } from "./mark_as/constants";
import { betterCompact } from "../../util";

export class MarkAs extends React.Component<StepParams, MarkAsSelection> {
  state: MarkAsSelection = NONE_SELECTED;

  render() {
    const { dispatch, currentStep, index, currentSequence } = this.props;
    const className = "wait-step";
    const setState: MarkAs["setState"] = this.setState.bind(this);
    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={ToolTips.WAIT}
        currentSequence={currentSequence}
        currentStep={currentStep}
        dispatch={dispatch}
        index={index} />
      <StepContent className={className}>
        <Row>
          <Col xs={4}>
            <label>{t("Mark")}</label>
            <FBSelect
              list={NOUNS}
              onChange={setNoun(setState)}
              allowEmpty={false}
              selectedItem={this.state.noun} />
          </Col>
          <Col xs={4}>
            <label>{t("As")}</label>
            <FBSelect
              list={betterCompact(adjectiveList(this.state))}
              onChange={setAdjective(setState)}
              allowEmpty={false}
              selectedItem={this.state.adjective} />
          </Col>
          <Col xs={4} />
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
