import * as React from "react";
import { t } from "i18next";
import { Row, Col } from "../../ui/index";
import { TaggedSequence, SequenceBodyItem } from "farmbot";
import { StepTitleBar } from "../step_tiles/step_title_bar";
import { StepIconGroup } from "../step_icon_group";

export interface StepHeaderProps {
  children?: React.ReactNode;
  className: string;
  helpText: string;
  currentSequence: TaggedSequence;
  currentStep: SequenceBodyItem;
  dispatch: Function;
  index: number;
  confirmStepDeletion: boolean;
}

export function StepHeader(props: StepHeaderProps) {
  const {
    className,
    helpText,
    currentSequence,
    currentStep,
    dispatch,
    index,
    confirmStepDeletion,
  } = props;
  return <Row>
    <Col sm={12}>
      <div className={`step-header ${className}`} draggable={true}>
        <StepTitleBar
          index={index}
          dispatch={dispatch}
          step={currentStep}
          sequence={currentSequence} />
        <StepIconGroup
          index={index}
          dispatch={dispatch}
          step={currentStep}
          sequence={currentSequence}
          helpText={t(helpText)}
          confirmStepDeletion={confirmStepDeletion} />
        {props.children}
      </div>
    </Col>
  </Row>;
}
