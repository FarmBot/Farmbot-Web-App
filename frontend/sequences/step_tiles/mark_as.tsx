import { Row, Col, FBSelect, DropDownItem } from "../../ui/index";
import { StepParams } from "../interfaces";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { ToolTips } from "../../constants";
import * as React from "react";
import { unpackStep } from "./mark_as/unpack_step";
import { ResourceUpdate } from "farmbot";
import { resourceList } from "./mark_as/resource_list";
import { actionList } from "./mark_as/action_list";
import { commitStepChanges } from "./mark_as/commit_step_changes";
import { t } from "../../i18next_wrapper";

interface MarkAsState { nextResource: DropDownItem | undefined }
const NONE = (): DropDownItem => ({ label: t("Select one"), value: 0 });

export class MarkAs extends React.Component<StepParams, MarkAsState> {
  state: MarkAsState = { nextResource: undefined };
  className = "resource-update-step";

  commitSelection = (nextAction: DropDownItem) => {
    this.props.dispatch(commitStepChanges({
      index: this.props.index,
      nextAction,
      nextResource: this.state.nextResource,
      sequence: this.props.currentSequence,
      step: this.props.currentStep as ResourceUpdate,
    }));
    this.setState({ nextResource: undefined });
  };

  render() {
    const step = this.props.currentStep as ResourceUpdate;
    const { rightSide, leftSide } =
      unpackStep({ step, resourceIndex: this.props.resources });
    return <StepWrapper>
      <StepHeader
        className={this.className}
        helpText={ToolTips.MARK_AS}
        currentSequence={this.props.currentSequence}
        currentStep={this.props.currentStep}
        dispatch={this.props.dispatch}
        index={this.props.index}
        confirmStepDeletion={this.props.confirmStepDeletion} />
      <StepContent className={this.className}>
        <Row>
          <Col xs={6}>
            <label>{t("Mark")}</label>
            <FBSelect
              list={resourceList(this.props.resources)}
              onChange={(nextResource) => this.setState({ nextResource })}
              allowEmpty={false}
              selectedItem={this.state.nextResource || leftSide} />
          </Col>
          <Col xs={6}>
            <label>{t("as")}</label>
            <FBSelect
              list={actionList(this.state.nextResource, step, this.props.resources)}
              onChange={this.commitSelection}
              key={JSON.stringify(rightSide) + JSON.stringify(this.state)}
              selectedItem={this.state.nextResource ? NONE() : rightSide} />
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
