import React from "react";
import { Row, Col } from "../../ui";
import { TaggedSequence, SequenceBodyItem } from "farmbot";
import { StepTitleBar } from "../step_tiles/step_title_bar";
import { StepIconGroup } from "./step_icon_group";
import { t } from "../../i18next_wrapper";
import { SequenceResource } from "farmbot/dist/resources/api_resources";

export interface StepHeaderProps {
  children?: React.ReactNode;
  className: string;
  helpText: string;
  currentSequence: TaggedSequence;
  currentStep: SequenceBodyItem;
  dispatch: Function;
  readOnly: boolean;
  index: number;
  executeSequence: SequenceResource | undefined;
  pinnedSequence: SequenceResource | undefined;
  pinnedView: boolean | undefined;
  togglePinnedView: (() => void) | undefined;
  confirmStepDeletion: boolean;
  viewRaw: boolean | undefined;
  toggleViewRaw: (() => void) | undefined;
  monacoEditor: boolean | undefined;
  toggleMonacoEditor: (() => void) | undefined;
  links: React.ReactElement[] | undefined;
}

interface StepHeaderState {
  draggable: boolean;
}

export class StepHeader
  extends React.Component<StepHeaderProps, StepHeaderState> {
  state: StepHeaderState = { draggable: true };
  toggle = (action: "enter" | "leave") => () =>
    this.setState({ draggable: action == "leave" });
  render() {
    const {
      className,
      currentSequence,
      currentStep,
      dispatch,
      readOnly,
      index,
      pinnedSequence,
    } = this.props;
    return <Row>
      <Col sm={12}>
        <div className={`step-header ${className} ${pinnedSequence?.color}`}
          draggable={this.state.draggable}>
          <StepTitleBar
            index={index}
            dispatch={dispatch}
            readOnly={readOnly}
            step={currentStep}
            sequence={currentSequence}
            pinnedSequenceName={this.props.pinnedSequence?.name}
            toggleDraggable={this.toggle} />
          {this.props.children}
          <StepIconGroup
            index={index}
            dispatch={dispatch}
            readOnly={readOnly}
            step={currentStep}
            sequence={currentSequence}
            executeSequenceName={this.props.executeSequence?.name}
            pinnedView={this.props.pinnedView}
            togglePinnedView={this.props.togglePinnedView}
            helpText={t(this.props.helpText)}
            links={this.props.links}
            viewRaw={this.props.viewRaw}
            toggleViewRaw={this.props.toggleViewRaw}
            monacoEditor={this.props.monacoEditor}
            toggleMonacoEditor={this.props.toggleMonacoEditor}
            confirmStepDeletion={this.props.confirmStepDeletion} />
        </div>
      </Col>
    </Row>;
  }
}
