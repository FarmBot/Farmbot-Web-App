import { Row, Col, FBSelect } from "../../ui/index";
import { StepParams } from "../interfaces";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import * as React from "react";
import { unpackStep } from "./mark_as/unpack_step";
import { ResourceUpdate } from "../../../latest_corpus";

export class MarkAs extends React.Component<StepParams, {}> {
  className = "wait-step";
  render() {
    const step = this.props.currentStep as ResourceUpdate;
    const { action, resource } =
      unpackStep({ step, resourceIndex: this.props.resources });
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
              list={[]}
              onChange={() => { }}
              allowEmpty={false}
              selectedItem={resource} />
          </Col>
          <Col xs={4}>
            <label>{t("as")}</label>
            <FBSelect
              list={[]}
              onChange={() => { }}
              selectedItem={action} />
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
