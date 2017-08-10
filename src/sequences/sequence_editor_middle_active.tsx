import * as React from "react";
import { DataXferObj, ActiveMiddleProps } from "./interfaces";
import { execSequence } from "../devices/actions";
import { editCurrentSequence } from "./actions";
import { splice, move } from "./step_tiles/index";
import { ColorPicker } from "../ui";
import { t } from "i18next";
import { BlurableInput, Row, Col, SaveBtn } from "../ui";
import { DropArea } from "../draggable/drop_area";
import { stepGet } from "../draggable/actions";
import { pushStep } from "./actions";
import { copySequence } from "./actions";
import { TaggedSequence } from "../resources/tagged_resources";
import { save, edit, destroy } from "../api/crud";
import { GetState } from "../redux/interfaces";
import { TestButton } from "./test_button";
import { warning } from "farmbot-toastr";
import { AllSteps } from "./all_steps";

let onDrop =
  (dispatch1: Function, sequence: TaggedSequence) =>
    (index: number, key: string) => {
      dispatch1(function (dispatch2: Function, getState: GetState) {
        let dataXferObj = dispatch2(stepGet(key));
        let step = dataXferObj.value;
        switch (dataXferObj.intent) {
          case "step_splice":
            return dispatch2(splice({ step, sequence, index }));
          case "step_move":
            let action =
              move({ step, sequence, to: index, from: dataXferObj.draggerId });
            return dispatch2(action);
          default:
            throw new Error("Got unexpected data transfer object.");
        }
      });
    };

let copy = function (dispatch: Function, sequence: TaggedSequence) {
  return (e: React.SyntheticEvent<HTMLButtonElement>) =>
    dispatch(copySequence(sequence));
};

export class SequenceEditorMiddleActive extends
  React.Component<ActiveMiddleProps, {}> {
  render() {
    let { dispatch, sequence } = this.props;
    let fixThisToo = function (key: string) {
      let xfer = dispatch(stepGet(key)) as DataXferObj;
      pushStep(xfer.value, dispatch, sequence);
    };

    let isSaving = sequence.saving;
    let isDirty = sequence.dirty;
    let isSaved = !isSaving && !isDirty;

    return (
      <div>
        <div className="button-group">
          <SaveBtn
            isDirty={isDirty}
            isSaving={isSaving}
            isSaved={isSaved}
            onClick={() => { dispatch(save(sequence.uuid)); }}
          />
          <TestButton
            syncStatus={this.props.syncStatus}
            sequence={sequence}
            onFail={warning}
            onClick={() => execSequence(sequence.body)} />
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
        </div>
        <Row>
          <Col xs={11}>
            <BlurableInput value={sequence.body.name}
              onCommit={(e) => {
                dispatch(edit(sequence, { name: e.currentTarget.value }));
              }} />
          </Col>
          <ColorPicker
            current={sequence.body.color}
            onChange={color => editCurrentSequence(dispatch, sequence, { color })}
          />
        </Row>
        <hr style={{ marginBottom: 0 }} />
        <AllSteps onDrop={onDrop(dispatch, sequence)} {...this.props} />
        <Row>
          <Col xs={12}>
            <DropArea isLocked={true}
              callback={fixThisToo}>
              {t("DRAG COMMAND HERE")}
            </DropArea>
          </Col>
        </Row>
      </div>
    );
  }
}
