import * as React from "react";
import { SyncStatus, ParameterApplication } from "farmbot/dist";
import { TaggedSequence } from "farmbot";
import { isParameterized } from "./locals_list/is_parameterized";
import { execSequence } from "../devices/actions";
import { Popover } from "@blueprintjs/core";
import { LocalsList } from "./locals_list/locals_list";
import { AllowedVariableNodes } from "./locals_list/locals_list_support";
import {
  addOrEditParamApps, variableList, mergeParameterApplications
} from "./locals_list/variable_support";
import { ResourceIndex, VariableNameSet, UUID } from "../resources/interfaces";
import { ShouldDisplay } from "../devices/interfaces";
import { Actions } from "../constants";
import { t } from "../i18next_wrapper";
import { warning } from "../toast/toast";

/** Can't test without saving and syncing sequence. */
const saveAndSyncWarning = () =>
  warning(t("Save sequence and sync device before running."));

/** Open or close the sequence test parameter assignment menu. */
export const setMenuOpen = (payload: boolean) => ({
  type: Actions.SET_SEQUENCE_POPUP_STATE,
  payload
});

interface ParameterAssignmentMenuProps {
  /** Saved and synced? */
  canTest: boolean;
  sequence: TaggedSequence;
  resources: ResourceIndex;
  varData: VariableNameSet | undefined;
  /** Edit a parameter application prepared for a sequence test. */
  editBodyVariables(variable: ParameterApplication): void;
  /** Parameter applications prepared for a sequence test. */
  bodyVariables: ParameterApplication[];
  shouldDisplay: ShouldDisplay;
  dispatch: Function;
}

/** Variable form used for assigning values to all variables
 * before running a sequence test. */
class ParameterAssignmentMenu
  extends React.Component<ParameterAssignmentMenuProps> {

  componentWillUnmount() {
    this.props.dispatch(setMenuOpen(false));
  }

  /** Click actions for test button inside parameter assignment menu. */
  onClick = () => {
    this.props.dispatch(setMenuOpen(false));
    this.props.canTest
      ? execSequence(this.props.sequence.body.id, this.props.bodyVariables)
      : saveAndSyncWarning();
  };

  render() {
    return <div className="parameter-assignment-menu">
      <div className="test-button-div">
        <Test canTest={this.props.canTest} onClick={this.onClick} />
      </div>
      <LocalsList
        bodyVariables={this.props.bodyVariables}
        variableData={this.props.varData}
        sequenceUuid={this.props.sequence.uuid}
        resources={this.props.resources}
        onChange={this.props.editBodyVariables}
        allowedVariableNodes={AllowedVariableNodes.variable}
        shouldDisplay={this.props.shouldDisplay} />
    </div>;
  }
}

interface TestProps {
  /** Saved and synced? */
  canTest: boolean;
  /** Call when test button is pressed. */
  onClick(): void;
  /** Parameter assignment menu open? */
  menuOpen?: boolean;
}

/** Sequence test button. Turns grey when sequence is not saved and synced. */
const Test = (props: TestProps) => {
  const normalColor = props.canTest ? "orange" : "pseudo-disabled";
  return <button
    className={`fb-button ${props.menuOpen ? "gray" : normalColor}`}
    onClick={props.onClick}>
    {props.menuOpen ? t("Close") : t("Test")}
  </button>;
};

export interface TestBtnProps {
  syncStatus: SyncStatus;
  sequence: TaggedSequence;
  resources: ResourceIndex;
  shouldDisplay: ShouldDisplay;
  /** Parameter assignment menu open? */
  menuOpen: boolean;
  dispatch: Function;
}

interface TestBtnState {
  bodyVariables: ParameterApplication[];
  /** Current sequence UUID. */
  uuid: UUID;
}

export class TestButton extends React.Component<TestBtnProps, TestBtnState> {
  state: TestBtnState = {
    bodyVariables: variableList(this.varData) || [],
    uuid: this.props.sequence.uuid,
  };

  get canTest(): boolean {
    const isSynced = this.props.syncStatus === "synced";
    const isSaved = !this.props.sequence.specialStatus;
    return isSynced && isSaved;
  }

  get varData() {
    return this.props.resources.sequenceMetas[this.props.sequence.uuid];
  }

  editBodyVariables = (variable: ParameterApplication) =>
    this.setState({
      bodyVariables: addOrEditParamApps(this.state.bodyVariables, variable)
    })

  /** Click actions for test button. */
  onClick = () => {
    const { menuOpen } = this.props;
    const sequenceBody = this.props.sequence.body;
    const bodyVariables =
      mergeParameterApplications(this.varData, this.state.bodyVariables);
    this.setState({ bodyVariables });
    /** Open the variable menu if the sequence has parameter declarations. */
    isParameterized(sequenceBody) && this.props.dispatch(setMenuOpen(!menuOpen));
    this.canTest
      /** Execute if sequence is synced, saved, and doesn't use parameters. */
      ? !isParameterized(sequenceBody) && execSequence(sequenceBody.id)
      : saveAndSyncWarning();
  };

  render() {
    const { menuOpen } = this.props;
    return <Popover className={"fb-button-popover-wrapper"} isOpen={menuOpen}
      popoverClassName="parameter-assignment-menu-popover">
      <Test canTest={this.canTest} onClick={this.onClick} menuOpen={menuOpen} />
      {isParameterized(this.props.sequence.body) &&
        <ParameterAssignmentMenu
          dispatch={this.props.dispatch}
          canTest={this.canTest}
          resources={this.props.resources}
          varData={this.varData}
          editBodyVariables={this.editBodyVariables}
          bodyVariables={this.state.bodyVariables}
          shouldDisplay={this.props.shouldDisplay}
          sequence={this.props.sequence} />}
    </Popover>;
  }
}
