import * as React from "react";
import { t } from "i18next";
import { Row, Col } from "../../ui/index";
import { TaggedSequence } from "../../resources/tagged_resources";
import { SequenceBodyItem } from "farmbot";
import { StepTitleBar } from "../step_tiles/step_title_bar";
import { StepIconGroup } from "../step_icon_group";
import { splice, remove } from "../step_tiles/index";

export interface StepHeaderProps {
  children?: React.ReactNode | React.ReactNode[];
  className: string;
  helpText: string;
  currentSequence: TaggedSequence;
  currentStep: SequenceBodyItem;
  dispatch: Function;
  index: number;
}

export function StepHeader(props: StepHeaderProps) {
  const {
    className,
    helpText,
    currentSequence,
    currentStep,
    dispatch,
    index
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
          onClone={() => dispatch(splice({
            step: currentStep,
            index,
            sequence: currentSequence
          }))}
          onTrash={() =>
            remove({ dispatch, index, sequence: currentSequence })}
          helpText={t(helpText)} />
        {props.children}
      </div>
    </Col>
  </Row>;
}
