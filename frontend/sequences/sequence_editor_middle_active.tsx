import * as React from "react";
import { ActiveMiddleProps, SequenceHeaderProps } from "./interfaces";
import { editCurrentSequence } from "./actions";
import { splice, move } from "./step_tiles";
import { push } from "../history";
import { BlurableInput, Row, Col, SaveBtn, ColorPicker, Help } from "../ui";
import { DropArea } from "../draggable/drop_area";
import { stepGet } from "../draggable/actions";
import { copySequence } from "./actions";
import { TaggedSequence, SyncStatus } from "farmbot";
import { save, edit, destroy } from "../api/crud";
import { TestButton } from "./test_button";
import { AllSteps } from "./all_steps";
import { LocalsList, localListCallback } from "./locals_list/locals_list";
import { betterCompact } from "../util";
import { AllowedVariableNodes } from "./locals_list/locals_list_support";
import { ResourceIndex } from "../resources/interfaces";
import { ShouldDisplay } from "../devices/interfaces";
import { isScopeDeclarationBodyItem } from "./locals_list/handle_select";
import { t } from "../i18next_wrapper";
import { Actions } from "../constants";
import { Popover, Position } from "@blueprintjs/core";
import { ToggleButton } from "../controls/toggle_button";
import { Content } from "../constants";
import {
  setWebAppConfigValue,
  GetWebAppConfigValue,
} from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { isUndefined } from "lodash";
import { NO_GROUPS } from "./locals_list/default_value_form";

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

export interface SequenceSettingsMenuProps {
  dispatch: Function;
  getWebAppConfigValue: GetWebAppConfigValue;
}

export interface SequenceSettingProps {
  label: string;
  description: string;
  dispatch: Function;
  setting: BooleanConfigKey;
  getWebAppConfigValue: GetWebAppConfigValue;
  confirmation?: string;
  defaultOn?: boolean;
}

export const SequenceSetting = (props: SequenceSettingProps) => {
  const raw_value = props.getWebAppConfigValue(props.setting);
  const value = (props.defaultOn && isUndefined(raw_value)) ? true : !!raw_value;
  const proceed = () =>
    (props.confirmation && !value) ? confirm(t(props.confirmation)) : true;
  return <fieldset>
    <label>
      {t(props.label)}
    </label>
    <Help text={t(props.description)} requireClick={true} />
    <ToggleButton
      toggleValue={value}
      toggleAction={() => proceed() &&
        props.dispatch(setWebAppConfigValue(props.setting, !value))} />
  </fieldset>;
};

export const SequenceSettingsMenu =
  ({ dispatch, getWebAppConfigValue }: SequenceSettingsMenuProps) => {
    const commonProps = { dispatch, getWebAppConfigValue };
    return <div className="sequence-settings-menu">
      <SequenceSetting {...commonProps}
        setting={BooleanSetting.confirm_step_deletion}
        label={t("Confirm step deletion")}
        description={Content.CONFIRM_STEP_DELETION} />
      <SequenceSetting {...commonProps}
        setting={BooleanSetting.confirm_sequence_deletion}
        defaultOn={true}
        label={t("Confirm sequence deletion")}
        description={Content.CONFIRM_SEQUENCE_DELETION} />
      <SequenceSetting {...commonProps}
        setting={BooleanSetting.show_pins}
        label={t("Show pins")}
        description={Content.SHOW_PINS} />
      <SequenceSetting {...commonProps}
        setting={BooleanSetting.expand_step_options}
        label={t("Open options by default")}
        description={Content.EXPAND_STEP_OPTIONS} />
      <SequenceSetting {...commonProps}
        setting={BooleanSetting.discard_unsaved_sequences}
        confirmation={Content.DISCARD_UNSAVED_SEQUENCE_CHANGES_CONFIRM}
        label={t("Discard unsaved sequence changes")}
        description={Content.DISCARD_UNSAVED_SEQUENCE_CHANGES} />
    </div>;
  };

interface SequenceBtnGroupProps {
  dispatch: Function;
  sequence: TaggedSequence;
  syncStatus: SyncStatus;
  resources: ResourceIndex;
  shouldDisplay: ShouldDisplay;
  menuOpen: boolean;
  getWebAppConfigValue: GetWebAppConfigValue;
}

const SequenceBtnGroup = ({
  dispatch,
  sequence,
  syncStatus,
  resources,
  shouldDisplay,
  menuOpen,
  getWebAppConfigValue
}: SequenceBtnGroupProps) =>
  <div className="button-group">
    <SaveBtn status={sequence.specialStatus}
      onClick={() => dispatch(save(sequence.uuid))} />
    <TestButton
      syncStatus={syncStatus}
      sequence={sequence}
      resources={resources}
      shouldDisplay={shouldDisplay}
      menuOpen={menuOpen}
      dispatch={dispatch} />
    <button
      className="fb-button red"
      onClick={() => {
        const confirm = getWebAppConfigValue(
          BooleanSetting.confirm_sequence_deletion);
        const force = isUndefined(confirm) ? false : !confirm;
        dispatch(destroy(sequence.uuid, force))
          .then(() => push("/app/sequences/"));
      }}>
      {t("Delete")}
    </button>
    <button
      className="fb-button yellow"
      onClick={() => dispatch(copySequence(sequence))}>
      {t("Copy")}
    </button>
    <div className={"settings-menu-button"}>
      <Popover position={Position.BOTTOM_RIGHT}>
        <i className="fa fa-gear" />
        <SequenceSettingsMenu
          dispatch={dispatch}
          getWebAppConfigValue={getWebAppConfigValue} />
      </Popover>
    </div>
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
  const variableData = props.resources.sequenceMetas[sequence.uuid] || {};
  const declarations = betterCompact(Object.values(variableData)
    .map(v => v &&
      isScopeDeclarationBodyItem(v.celeryNode) ? v.celeryNode : undefined));
  return <div id="sequence-editor-tools" className="sequence-editor-tools">
    <SequenceBtnGroup {...sequenceAndDispatch}
      syncStatus={props.syncStatus}
      resources={props.resources}
      shouldDisplay={props.shouldDisplay}
      getWebAppConfigValue={props.getWebAppConfigValue}
      menuOpen={props.menuOpen} />
    <SequenceNameAndColor {...sequenceAndDispatch} />
    <LocalsList
      variableData={variableData}
      sequenceUuid={sequence.uuid}
      resources={props.resources}
      onChange={localListCallback(props)(declarations)}
      locationDropdownKey={JSON.stringify(sequence)}
      allowedVariableNodes={AllowedVariableNodes.parameter}
      collapsible={true}
      collapsed={props.variablesCollapsed}
      toggleVarShow={props.toggleVarShow}
      shouldDisplay={props.shouldDisplay}
      customFilterRule={NO_GROUPS} />
  </div>;
};

interface ActiveMiddleState {
  variablesCollapsed: boolean;
}

export class SequenceEditorMiddleActive extends
  React.Component<ActiveMiddleProps, ActiveMiddleState> {
  state: ActiveMiddleState = { variablesCollapsed: false };

  /** Make room for the sequence header variable form when necessary. */
  get stepSectionHeight() {
    const { resources, sequence } = this.props;
    let subHeight = 200;
    const variables =
      Object.keys(resources.sequenceMetas[sequence.uuid] || {}).length > 0;
    if (variables) { subHeight = 500; }
    if (this.state.variablesCollapsed) { subHeight = 300; }
    const variablesDiv = document.getElementById("sequence-editor-tools");
    if (variablesDiv) { subHeight = 200 + variablesDiv.offsetHeight; }
    return `calc(100vh - ${subHeight}px)`;
  }

  get stepProps() {
    const getConfig = this.props.getWebAppConfigValue;
    return {
      sequence: this.props.sequence,
      onDrop: onDrop(this.props.dispatch, this.props.sequence),
      dispatch: this.props.dispatch,
      resources: this.props.resources,
      hardwareFlags: this.props.hardwareFlags,
      farmwareInfo: this.props.farmwareInfo,
      shouldDisplay: this.props.shouldDisplay,
      confirmStepDeletion: !!getConfig(BooleanSetting.confirm_step_deletion),
      showPins: !!getConfig(BooleanSetting.show_pins),
      expandStepOptions: !!getConfig(BooleanSetting.expand_step_options),
    };
  }

  render() {
    const { dispatch, sequence } = this.props;
    return <div className="sequence-editor-content">
      <SequenceHeader
        dispatch={this.props.dispatch}
        sequence={sequence}
        resources={this.props.resources}
        syncStatus={this.props.syncStatus}
        shouldDisplay={this.props.shouldDisplay}
        variablesCollapsed={this.state.variablesCollapsed}
        toggleVarShow={() =>
          this.setState({ variablesCollapsed: !this.state.variablesCollapsed })}
        getWebAppConfigValue={this.props.getWebAppConfigValue}
        menuOpen={this.props.menuOpen} />
      <hr />
      <div className="sequence" id="sequenceDiv"
        style={{ height: this.stepSectionHeight }}>
        <AllSteps {...this.stepProps} />
        <Row>
          <Col xs={12}>
            <DropArea isLocked={true}
              callback={key => onDrop(dispatch, sequence)(Infinity, key)}>
              {t("DRAG COMMAND HERE")}
            </DropArea>
            <AddCommandButton dispatch={dispatch} index={99999999} />
          </Col>
        </Row>
      </div>
    </div>;
  }
}

export const AddCommandButton = (props: { dispatch: Function, index: number }) =>
  <div className="add-command-button-container">
    <button
      className="add-command fb-button gray"
      onClick={() => props.dispatch({
        type: Actions.SET_SEQUENCE_STEP_POSITION,
        payload: props.index,
      })}>
      {t("Add command")}
    </button>
  </div>;
