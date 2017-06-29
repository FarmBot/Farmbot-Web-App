import * as React from "react";
import { SequenceBodyItem, LegalSequenceKind } from "farmbot";
import { DataXferObj, ActiveMiddleProps } from "./interfaces";
import { execSequence } from "../devices/actions";
import { editCurrentSequence } from "./actions";
import { renderCeleryNode, splice, move } from "./step_tiles/index";
import { ColorPicker } from "./color_picker";
import { t } from "i18next";
import { BlurableInput, Row, Col, SaveBtn, ToolTip } from "../ui";
import { DropArea } from "../draggable/drop_area";
import { stepGet } from "../draggable/actions";
import { pushStep } from "./actions";
import { StepDragger, NULL_DRAGGER_ID } from "../draggable/step_dragger";
import { copySequence } from "./actions";
import { TaggedSequence } from "../resources/tagged_resources";
import { save, edit, destroy } from "../api/crud";
import { GetState } from "../redux/interfaces";
import { ToolTips } from "../constants";

let onDrop = (index: number, dispatch: Function, sequence: TaggedSequence) =>
  (key: string) => {
    dispatch(function (dispatch: Function, getState: GetState) {
      let dataXferObj = dispatch(stepGet(key));
      let step = dataXferObj.value;
      switch (dataXferObj.intent) {
        case "step_splice":
          return dispatch(splice({ step, sequence, index }));
        case "step_move":
          let action =
            move({ step, sequence, to: index, from: dataXferObj.draggerId });
          return dispatch(action);
        default:
          throw new Error("Got unexpected data transfer object.");
      }
    });
  };

let copy = function (dispatch: Function, sequence: TaggedSequence) {
  return (e: React.SyntheticEvent<HTMLButtonElement>) =>
    dispatch(copySequence(sequence));
};

export let performSeq = (dispatch: Function, s: TaggedSequence) => {
  return () => {
    dispatch(save(s.uuid)).then(() => execSequence(s.body));
  };
};

export class SequenceEditorMiddleActive
  extends React.Component<ActiveMiddleProps, {}> {
  render() {
    let { sequences, dispatch, tools, sequence, slots, resources } = this.props;
    let fixThisToo = function (key: string) {
      let xfer = dispatch(stepGet(key)) as DataXferObj;
      if (xfer.draggerId === NULL_DRAGGER_ID) {
        pushStep(xfer.value, dispatch, sequence);
      } else {
        pushStep(xfer.value, dispatch, sequence);
      };
    };

    let isSaving = sequence.saving;
    let isDirty = sequence.dirty;
    let isSaved = !isSaving && !isDirty;

    return <div className="sequence-editor">
      <h3>
        <i>{t("Sequence Editor")}</i>
      </h3>
      <ToolTip helpText={ToolTips.SEQUENCE_EDITOR} />
      <SaveBtn
        isDirty={isDirty}
        isSaving={isSaving}
        isSaved={isSaved}
        onClick={() => { dispatch(save(sequence.uuid)); }}
      />
      <button
        className="fb-button orange"
        onClick={performSeq(dispatch, sequence)}
      >
        {t("Save & Run")}
      </button>
      <button
        className="fb-button red"
        onClick={() => dispatch(destroy(sequence.uuid))}
      >
        {t("Delete")}
      </button>
      <button
        className="fb-button yellow"
        onClick={copy(dispatch, sequence)}
      >
        {t("Copy")}
      </button>
      <Row>
        <Col xs={11}>
          <BlurableInput value={sequence.body.name}
            onCommit={(e) => {
              dispatch(edit(sequence, { name: e.currentTarget.value }))
            }} />
        </Col>
        <ColorPicker current={sequence.body.color}
          onChange={color => editCurrentSequence(dispatch, sequence, { color })} />
      </Row>
      {(sequence.body.body || []).map((currentStep: SequenceBodyItem, index, arr) => {
        /** HACK: If we wrote `key={index}` for this iterator, React's diff
         * algorithm (probably?) loses track of which step has changed (and
         * sometimes even mix up the state of completely different steps).
         * To get around this, we add a `uuid` property to Steps that
         * is guaranteed to be unique and allows React to diff the list
         * correctly.
         */
        let wow = (currentStep as any).uuid || index;
        let currentSequence = sequence;
        return <div key={wow}>
          <DropArea callback={onDrop(index, dispatch, sequence)} />
          <StepDragger dispatch={dispatch}
            step={currentStep}
            ghostCss="step-drag-ghost-image-big"
            intent="step_move"
            draggerId={index}>
            {renderCeleryNode(currentStep.kind as LegalSequenceKind, {
              currentStep,
              index,
              dispatch: dispatch,
              sequences: sequences,
              currentSequence,
              slots,
              tools,
              resources
            })}
          </StepDragger>
        </div>;
      })}
      <Row>
        <Col xs={12}>
          <DropArea isLocked={true}
            callback={fixThisToo}>
            {t("DRAG COMMAND HERE")}
          </DropArea>
        </Col>
      </Row>
    </div>;
  }
}
