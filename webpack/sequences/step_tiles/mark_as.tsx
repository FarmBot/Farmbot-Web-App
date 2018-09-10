import { Row, Col, FBSelect, DropDownItem } from "../../ui/index";
import { StepParams } from "../interfaces";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import * as React from "react";
import { unpackStep } from "./mark_as/unpack_step";
import { ResourceUpdate } from "../../../latest_corpus";
import { resourceList } from "./mark_as/resource_list";
import { actionList } from "./mark_as/action_list";
import { editStep } from "../../api/crud";
import { packStep } from "./mark_as/pack_step";
import { fancyDebug } from "../../util";

interface MarkAsState { nextResource: DropDownItem | undefined }

export class MarkAs extends React.Component<StepParams, MarkAsState> {
  state: MarkAsState = { nextResource: undefined };
  className = "wait-step";

  commitSelection = (nextAction: DropDownItem) => {
    const { nextResource } = this.state;
    const nextStep =
      packStep(this.props.currentStep as ResourceUpdate, nextResource, nextAction);
    this.props.dispatch(editStep({
      step: this.props.currentStep,
      sequence: this.props.currentSequence,
      index: this.props.index,
      executor(c) {
        if (c.kind == "resource_update") {
          c.args.label = nextStep.args.label;
          c.args.value = nextStep.args.value;
          c.args.resource_type = nextStep.args.resource_type;
          c.args.resource_id = nextStep.args.resource_id;
          fancyDebug(c.args);
        }
      }
    }));
    this.setState({ nextResource: undefined });
  };

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
          <Col xs={6}>
            <label>{t("Mark")}</label>
            <FBSelect
              list={resourceList(this.props.resources)}
              onChange={(nextResource) => this.setState({ nextResource })}
              allowEmpty={false}
              selectedItem={this.state.nextResource || resource} />
          </Col>
          <Col xs={6}>
            <label>{t("as")}</label>
            <FBSelect
              list={actionList(this.state.nextResource, step, this.props.resources)}
              onChange={this.commitSelection}
              key={JSON.stringify(action) + JSON.stringify(this.state)}
              selectedItem={action} />
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
