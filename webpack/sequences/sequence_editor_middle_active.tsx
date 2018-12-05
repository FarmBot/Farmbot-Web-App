import * as React from "react";
import { ActiveMiddleProps, SequenceHeaderProps } from "./interfaces";
import { execSequence } from "../devices/actions";
import { editCurrentSequence } from "./actions";
import { splice, move } from "./step_tiles/index";
import { t } from "i18next";
import { BlurableInput, Row, Col, SaveBtn, ColorPicker } from "../ui/index";
import { DropArea } from "../draggable/drop_area";
import { stepGet } from "../draggable/actions";
import { copySequence } from "./actions";
import { TaggedSequence, SyncStatus } from "farmbot";
import { save, edit, destroy } from "../api/crud";
import { TestButton } from "./test_button";
import { warning } from "farmbot-toastr";
import { AllSteps } from "./all_steps";
import { LocalsList } from "./locals_list";
import { Feature } from "../devices/interfaces";
import { extractParent } from "../resources/sequence_meta";

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

const SequenceBtnGroup = ({ dispatch, sequence, syncStatus }: {
  dispatch: Function, sequence: TaggedSequence, syncStatus: SyncStatus
}) =>
  <div className="button-group">
    <SaveBtn status={sequence.specialStatus}
      onClick={() => dispatch(save(sequence.uuid))} />
    <TestButton
      syncStatus={syncStatus}
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
      onClick={() => dispatch(copySequence(sequence))}>
      {t("Copy")}
    </button>
  </div>;

export const SequenceNameAndColor = ({ dispatch, sequence }: {
  dispatch: Function, sequence: TaggedSequence
}) =>
  <Row>
    <Col xs={11}>
      <BlurableInput value={sequence.body.name}
        placeholder={t("Sequence Name")}
        onCommit={e =>
          dispatch(edit(sequence, { name: e.currentTarget.value }))} />
    </Col>
    <Col xs={1} className="color-picker-col">
      <ColorPicker
        current={sequence.body.color}
        onChange={color =>
          editCurrentSequence(dispatch, sequence, { color })} />
    </Col>
  </Row>;

const SequenceHeader = (props: SequenceHeaderProps) => {
  const { sequence, dispatch } = props;
  const sequenceAndDispatch = { sequence, dispatch };
  return <div className="sequence-editor-tools">
    <SequenceBtnGroup {...sequenceAndDispatch} syncStatus={props.syncStatus} />
    <SequenceNameAndColor {...sequenceAndDispatch} />
    <LocalsList
      variableData={props.resources.sequenceMetas[sequence.uuid] || {}}
      sequence={sequence}
      dispatch={dispatch}
      resources={props.resources} />
  </div>;
};

export class SequenceEditorMiddleActive extends
  React.Component<ActiveMiddleProps, {}> {
  get stepSectionHeight() {
    const { resources, sequence } = this.props;
    const variable = this.props.shouldDisplay(Feature.variables)
      ? !!extractParent(resources, sequence.uuid) : false;
    return `calc(100vh - ${variable ? "38" : "25"}rem)`;
  }

  render() {
    const { dispatch, sequence } = this.props;
    return <div className="sequence-editor-content">
      <SequenceHeader
        dispatch={this.props.dispatch}
        sequence={sequence}
        resources={this.props.resources}
        syncStatus={this.props.syncStatus}
        shouldDisplay={this.props.shouldDisplay} />
      <hr />
      <div className="sequence" id="sequenceDiv"
        style={{ height: this.stepSectionHeight }}>
        <AllSteps onDrop={onDrop(dispatch, sequence)} {...this.props} />
        <Row>
          <Col xs={12}>
            <DropArea isLocked={true}
              callback={key => onDrop(dispatch, sequence)(Infinity, key)}>
              {t("DRAG COMMAND HERE")}
            </DropArea>
          </Col>
        </Row>
      </div>
    </div>;
  }
}
