import React from "react";
import { Row, Col } from "../../ui/index";
import { TaggedSequence, SequenceBodyItem } from "farmbot";
import { StepTitleBar } from "../step_tiles/step_title_bar";
import { StepIconGroup } from "../step_icon_group";
import { t } from "../../i18next_wrapper";
import { SequenceResource } from "farmbot/dist/resources/api_resources";

export interface StepHeaderProps {
  children?: React.ReactNode;
  className: string;
  helpText: string;
  currentSequence: TaggedSequence;
  currentStep: SequenceBodyItem;
  dispatch: Function;
  index: number;
  executeSequence: SequenceResource | undefined;
  pinnedSequence: SequenceResource | undefined;
  confirmStepDeletion: boolean;
  toggleViewRaw?: () => void;
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
      helpText,
      currentSequence,
      currentStep,
      dispatch,
      index,
      confirmStepDeletion,
      pinnedSequence,
    } = this.props;
    return <Row>
      <Col sm={12}>
        <div className={`step-header ${className} ${pinnedSequence?.color}`}
          draggable={this.state.draggable}>
          <StepTitleBar
            index={index}
            dispatch={dispatch}
            step={currentStep}
            sequence={currentSequence}
            pinnedSequenceName={this.props.pinnedSequence?.name}
            toggleDraggable={this.toggle} />
          <StepIconGroup
            index={index}
            dispatch={dispatch}
            step={currentStep}
            sequence={currentSequence}
            executeSequenceName={this.props.executeSequence?.name}
            helpText={t(helpText)}
            toggleViewRaw={this.props.toggleViewRaw}
            confirmStepDeletion={confirmStepDeletion} />
          {this.props.children}
        </div>
      </Col>
    </Row>;
  }
}
