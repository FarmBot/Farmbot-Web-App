import React from "react";
import { ErrorBoundary } from "../../error_boundary";
import { TaggedSequence, SequenceBodyItem } from "farmbot";
import { StepState } from "../interfaces";
import { stringifySequenceData } from "../step_tiles";
import { Row, Col } from "../../ui";
import { StepHeader } from "./step_header";
import { getWebAppConfigValueFromResources } from "../../config_storage/actions";
import { ResourceIndex } from "../../resources/interfaces";
import { BooleanSetting } from "../../session_keys";
import { findSequenceById } from "../../resources/selectors";

export interface StepWrapperProps {
  children?: React.ReactNode;
  warning?: React.ReactNode;
  className: string;
  helpText: string;
  currentSequence: TaggedSequence;
  currentStep: SequenceBodyItem;
  dispatch: Function;
  readOnly: boolean;
  index: number;
  resources: ResourceIndex;
  monacoEditor?: boolean;
  toggleMonacoEditor?(): void;
  links?: React.ReactElement[];
  enableMarkdown?: boolean;
}

export class StepWrapper extends React.Component<StepWrapperProps, StepState> {
  state: StepState = {};

  get getConfigValue() {
    return getWebAppConfigValueFromResources(this.props.resources);
  }

  get viewCeleryScript() {
    return this.getConfigValue(BooleanSetting.view_celery_script);
  }

  get viewRaw() {
    return this.viewCeleryScript && (this.state.viewRaw ?? true);
  }

  get toggleViewRaw() {
    return this.viewCeleryScript
      ? () => this.setState({ viewRaw: !this.viewRaw })
      : undefined;
  }

  render() {
    const confirmStepDeletion =
      !!this.getConfigValue(BooleanSetting.confirm_step_deletion);
    const step = this.props.currentStep;
    const executeSequence = step.kind == "execute" && step.args.sequence_id
      ? findSequenceById(this.props.resources, step.args.sequence_id).body
      : undefined;
    return <div className={`step-wrapper ${this.props.className}`}>
      <StepHeader
        className={this.props.className}
        helpText={this.props.helpText}
        enableMarkdown={this.props.enableMarkdown}
        links={this.props.links}
        currentSequence={this.props.currentSequence}
        currentStep={this.props.currentStep}
        dispatch={this.props.dispatch}
        readOnly={this.props.readOnly}
        index={this.props.index}
        executeSequence={executeSequence}
        viewRaw={!!this.viewRaw}
        toggleViewRaw={this.toggleViewRaw}
        monacoEditor={this.props.monacoEditor}
        toggleMonacoEditor={this.props.toggleMonacoEditor}
        confirmStepDeletion={confirmStepDeletion}>
        {this.props.warning}
      </StepHeader>
      {this.viewRaw
        ? <pre>{stringifySequenceData(this.props.currentStep)}</pre>
        : <Row>
          <Col sm={12}>
            <div className={[
              "step-content", this.props.className, executeSequence?.color,
            ].join(" ")}>
              <ErrorBoundary>
                {this.props.children}
              </ErrorBoundary>
            </div>
          </Col>
        </Row>}
    </div>;
  }
}
