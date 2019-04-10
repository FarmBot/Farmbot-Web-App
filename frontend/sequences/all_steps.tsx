import * as React from "react";
import { TaggedSequence } from "farmbot";
import { SequenceBodyItem } from "farmbot/dist";
import { DropArea } from "../draggable/drop_area";
import { StepDragger } from "../draggable/step_dragger";
import { renderCeleryNode } from "./step_tiles/index";
import { ResourceIndex } from "../resources/interfaces";
import { getStepTag } from "../resources/sequence_tagging";
import { HardwareFlags, FarmwareInfo } from "./interfaces";
import { ShouldDisplay } from "../devices/interfaces";
import { AddCommandButton } from "./sequence_editor_middle_active";

interface AllStepsProps {
  sequence: TaggedSequence;
  onDrop(index: number, key: string): void;
  dispatch: Function;
  resources: ResourceIndex;
  hardwareFlags?: HardwareFlags;
  farmwareInfo?: FarmwareInfo;
  shouldDisplay?: ShouldDisplay;
  confirmStepDeletion: boolean;
}

export class AllSteps extends React.Component<AllStepsProps, {}> {
  render() {
    const {
      sequence, onDrop, dispatch, hardwareFlags, farmwareInfo, shouldDisplay
    } = this.props;
    const items = (sequence.body.body || [])
      .map((currentStep: SequenceBodyItem, index) => {
        /** HACK: React's diff algorithm (probably?) can't keep track of steps
         * via `index` alone- the content is too dynamic (copy/splice/pop/push)
         * To get around this, we add a `uuid` property to Steps that
         * is guaranteed to be unique no matter where the step gets moved and
         * allows React to diff the list correctly. */
        const readThatCommentAbove = getStepTag(currentStep);
        return <div className="sequence-steps"
          key={readThatCommentAbove}>
          <AddCommandButton dispatch={dispatch} index={index} />
          <DropArea callback={(key) => onDrop(index, key)} />
          <StepDragger
            dispatch={dispatch}
            step={currentStep}
            intent="step_move"
            draggerId={index}>
            <div>
              {renderCeleryNode({
                currentStep,
                index,
                dispatch,
                currentSequence: sequence,
                resources: this.props.resources,
                hardwareFlags,
                farmwareInfo,
                shouldDisplay,
                confirmStepDeletion: this.props.confirmStepDeletion,
              })}
            </div>
          </StepDragger>
        </div>;
      });

    return <div> {items} </div>;
  }
}
