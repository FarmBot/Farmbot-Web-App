import React from "react";
import { ErrorBoundary } from "../../error_boundary";
import { TaggedSequence, SequenceBodyItem } from "farmbot";
import { SequenceReducerState, StepState } from "../interfaces";
import { stringifySequenceData } from "../step_tiles";
import { Row } from "../../ui";
import { StepHeader } from "./step_header";
import { getWebAppConfigValueFromResources } from "../../config_storage/actions";
import { ResourceIndex } from "../../resources/interfaces";
import { BooleanSetting } from "../../session_keys";
import { findSequenceById } from "../../resources/selectors";

interface StateToggle {
  enabled: boolean;
  toggle(): void;
}

export enum StateToggleKey {
  monacoEditor = "monacoEditor",
  luaExpanded = "luaExpanded",
}

export type StateToggles = Partial<Record<StateToggleKey, StateToggle>>;

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
  stateToggles?: StateToggles;
  links?: React.ReactElement[];
  enableMarkdown?: boolean;
  sequencesState: SequenceReducerState;
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

  setKey = (updateKey: string) => this.setState({ updateKey });

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
        sequencesState={this.props.sequencesState}
        executeSequence={executeSequence}
        viewRaw={!!this.viewRaw}
        toggleViewRaw={this.toggleViewRaw}
        stateToggles={this.props.stateToggles}
        setKey={this.setKey}
        confirmStepDeletion={confirmStepDeletion}>
        {this.props.warning}
      </StepHeader>
      {this.viewRaw
        ? <pre className="celeryscript">
          {stringifySequenceData(this.props.currentStep)}
        </pre>
        : <Row>
          <div className={[
            "step-content", this.props.className, executeSequence?.color,
          ].join(" ")}>
            <ErrorBoundary key={this.state.updateKey}>
              {this.props.children}
            </ErrorBoundary>
          </div>
        </Row>}
    </div>;
  }
}
