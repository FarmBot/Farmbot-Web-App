import * as React from "react";
import { t } from "i18next";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect } from "../../ui/index";
import {
  MARK_AS_ACTIONS,
  MARK_AS_OBJECTS,
  MarkableKind,
  selectedMarkableObject,
  setObjectKind,
} from "./mark_as/options";

export interface MarkAsState { markableKind: MarkableKind | undefined; }

export class MarkAs extends React.Component<StepParams, MarkAsState> {
  state: MarkAsState = { markableKind: undefined };

  render() {
    const { dispatch, currentStep, index, currentSequence } = this.props;
    const className = "wait-step";
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
              list={MARK_AS_OBJECTS}
              onChange={setObjectKind(this.setState.bind(this))}
              selectedItem={selectedMarkableObject(this.state.markableKind)} />
          </Col>
          <Col xs={4}>
            <label>{t("As")}</label>
            <FBSelect
              list={MARK_AS_ACTIONS["Plant"]}
              onChange={() => { }}
              allowEmpty={false}
              selectedItem={MARK_AS_ACTIONS["Plant"][0]} />
          </Col>
          <Col xs={4} />
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
