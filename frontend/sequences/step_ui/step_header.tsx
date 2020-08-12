import * as React from "react";
import { Row, Col } from "../../ui/index";
import { TaggedSequence, SequenceBodyItem } from "farmbot";
import { StepTitleBar } from "../step_tiles/step_title_bar";
import { StepIconGroup } from "../step_icon_group";
import { t } from "../../i18next_wrapper";

export interface StepHeaderProps {
  children?: React.ReactNode;
  className: string;
  helpText: string;
  currentSequence: TaggedSequence;
  currentStep: SequenceBodyItem;
  dispatch: Function;
  index: number;
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
    } = this.props;
    return <Row>
      <Col sm={12}>
        <div className={`step-header ${className}`}
          draggable={this.state.draggable}>
          <StepTitleBar
            index={index}
            dispatch={dispatch}
            step={currentStep}
            sequence={currentSequence}
            toggleDraggable={this.toggle} />
          <StepIconGroup
            index={index}
            dispatch={dispatch}
            step={currentStep}
            sequence={currentSequence}
            helpText={t(helpText)}
            toggleViewRaw={this.props.toggleViewRaw}
            confirmStepDeletion={confirmStepDeletion} />
          {this.props.children}
        </div>
      </Col>
    </Row>;
  }
}
