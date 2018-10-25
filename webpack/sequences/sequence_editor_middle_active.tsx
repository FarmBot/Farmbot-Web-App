import * as React from "react";
import { ActiveMiddleProps } from "./interfaces";
import { execSequence } from "../devices/actions";
import { editCurrentSequence } from "./actions";
import { splice, move } from "./step_tiles/index";
import { t } from "i18next";
import { BlurableInput, Row, Col, SaveBtn, ColorPicker } from "../ui/index";
import { DropArea } from "../draggable/drop_area";
import { stepGet } from "../draggable/actions";
import { copySequence } from "./actions";
import { TaggedSequence } from "farmbot";
import { save, edit, destroy } from "../api/crud";
import { TestButton } from "./test_button";
import { warning } from "farmbot-toastr";
import { AllSteps } from "./all_steps";
import { LocalsList } from "./locals_list";

export const onDrop =
  (dispatch1: Function, sequence: TaggedSequence) =>
    (index: number, key: string) => {
      if (key.length > 0) {
        dispatch1(function (dispatch2: Function) {
          const dataXferObj = dispatch2(stepGet(key));
          const step = dataXferObj.value;
          switch (dataXferObj.intent) {
            case "step_splice":
              return dispatch2(splice({ step, sequence, index }));
            case "step_move":
              const action =
                move({ step, sequence, to: index, from: dataXferObj.draggerId });
              return dispatch2(action);
            default:
              throw new Error("Got unexpected data transfer object.");
          }
        });
      }
    };

const copy = function (dispatch: Function, sequence: TaggedSequence) {
  return () => dispatch(copySequence(sequence));
};

export class SequenceEditorMiddleActive extends
  React.Component<ActiveMiddleProps, {}> {
  render() {
    const { dispatch, sequence } = this.props;

    return <div className="sequence-editor-content">
      <div className="sequence-editor-tools">
        <div className="button-group">
          <SaveBtn status={sequence.specialStatus}
            onClick={() => { dispatch(save(sequence.uuid)); }} />
          <TestButton
            syncStatus={this.props.syncStatus}
            sequence={sequence}
            onFail={warning}
            onClick={() => execSequence(sequence.body)} />
          <button
            className="fb-button red"
            onClick={() => dispatch(destroy(sequence.uuid))}>
            {t("Delete")}
          </button>
          <button
            className="fb-button yellow"
            onClick={copy(dispatch, sequence)}>
            {t("Copy")}
          </button>
        </div>
        <Row>
          <Col xs={11}>
            <BlurableInput value={sequence.body.name}
              placeholder={t("Sequence Name")}
              onCommit={(e) => {
                dispatch(edit(sequence, { name: e.currentTarget.value }));
              }} />
          </Col>
          <Col xs={1} className="color-picker-col">
            <ColorPicker
              current={sequence.body.color}
              onChange={color => editCurrentSequence(dispatch, sequence, { color })} />
          </Col>
        </Row>
        <LocalsList
          sequence={this.props.sequence}
          resources={this.props.resources}
          dispatch={this.props.dispatch} />
        <hr />
      </div>
      <div className="sequence" id="sequenceDiv">
        <AllSteps onDrop={onDrop(dispatch, sequence)} {...this.props} />
        <Row>
          <Col xs={12}>
            <DropArea isLocked={true}
              callback={(key) => onDrop(dispatch, sequence)(Infinity, key)}>
              {t("DRAG COMMAND HERE")}
            </DropArea>
          </Col>
        </Row>
      </div>
    </div>;
  }
}
