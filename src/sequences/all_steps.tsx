import * as React from "react";
import { TaggedSequence } from "../resources/tagged_resources";
import { SequenceBodyItem, LegalSequenceKind } from "farmbot/dist";
import { get } from "lodash";
import { DropArea } from "../draggable/drop_area";
import { StepDragger } from "../draggable/step_dragger";
import { renderCeleryNode } from "./step_tiles/index";
import { ResourceIndex } from "../resources/interfaces";

interface AllStepsProps {
  sequence: TaggedSequence;
  onDrop(index: number, key: string): void;
  dispatch: Function;
  resources: ResourceIndex;
}

export function AllSteps(props: AllStepsProps) {
  let { sequence, onDrop, dispatch } = props;
  let items = (sequence.body.body || [])
    .map((currentStep: SequenceBodyItem, index, arr) => {
      /** HACK: React's diff algorithm (probably?) can't keep track of steps
       * via `index` alone- the content is too dynamic (copy/splice/pop/push)
       * To get around this, we add a `uuid` property to Steps that
       * is guaranteed to be unique no matter where the step gets moved and
       * allows React to diff the list correctly. */
      let readThatCommentAbove = get(currentStep, "uuid", index);
      return <div
        key={readThatCommentAbove}>
        <DropArea callback={(key) => onDrop(index, key)} />
        <StepDragger
          dispatch={dispatch}
          step={currentStep}
          ghostCss="step-drag-ghost-image-big"
          intent="step_move"
          draggerId={index}>
          <div>
            {renderCeleryNode(currentStep.kind as LegalSequenceKind, {
              currentStep,
              index,
              dispatch: dispatch,
              currentSequence: sequence,
              resources: props.resources
            })}
          </div>
        </StepDragger>
      </div>;
    });

  return <div> {items} </div>;
}
