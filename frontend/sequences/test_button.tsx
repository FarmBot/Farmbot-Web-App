import React from "react";
import { SyncStatus, ParameterApplication, TaggedSequence } from "farmbot";
import { isParameterized } from "./locals_list/is_parameterized";
import { execSequence } from "../devices/actions";
import { LocalsList } from "./locals_list/locals_list";
import { AllowedVariableNodes } from "./locals_list/locals_list_support";
import {
  addOrEditParamApps, variableList, mergeParameterApplications,
} from "./locals_list/variable_support";
import { ResourceIndex, VariableNameSet, UUID } from "../resources/interfaces";
import { Actions } from "../constants";
import { t } from "../i18next_wrapper";
import { warning } from "../toast/toast";
import { forceOnline } from "../devices/must_be_online";
import { Popover } from "../ui";
import { RunButtonMenuOpen } from "./interfaces";

export const isMenuOpen = (
  state: RunButtonMenuOpen,
  current: RunButtonMenuOpen,
): boolean => (state.component == current.component) && (state.uuid == current.uuid);

const closedMenu = (): RunButtonMenuOpen => ({
  component: undefined, uuid: undefined,
});

/** Can't test without saving and syncing sequence. */
const saveAndSyncWarning = () =>
  warning(t("Save sequence and sync device before running."));

/** Open or close the sequence test parameter assignment menu. */
export const setMenuOpen = (payload: RunButtonMenuOpen) => ({
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
  dispatch: Function;
}

/** Variable form used for assigning values to all variables
 * before running a sequence test. */
class ParameterAssignmentMenu
  extends React.Component<ParameterAssignmentMenuProps> {

  componentWillUnmount() {
    this.props.dispatch(setMenuOpen(closedMenu()));
  }

  /** Click actions for test button inside parameter assignment menu. */
  onClick = () => {
    this.props.dispatch(setMenuOpen(closedMenu()));
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
        allowedVariableNodes={AllowedVariableNodes.variable} />
    </div>;
  }
}

interface TestProps {
  /** Saved and synced? */
  canTest: boolean;
  /** Call when test button is pressed. */
  onClick(): void;
  /** Parameter assignment menu open? */
  menuIsOpen?: boolean;
}

/** Sequence test button. Turns grey when sequence is not saved and synced. */
const Test = (props: TestProps) => {
  const normalColor = `orange ${props.canTest ? "" : "pseudo-disabled"}`;
  const buttonText = props.menuIsOpen
    ? t("Close")
    : t("Run");
  return <button
    className={`fb-button ${props.menuIsOpen ? "gray" : normalColor}`}
    title={buttonText}
    onClick={props.onClick}>
    {buttonText}
  </button>;
};

export interface TestBtnProps {
  syncStatus: SyncStatus | undefined;
  sequence: TaggedSequence;
  resources: ResourceIndex;
  /** Parameter assignment menu open? */
  menuOpen: RunButtonMenuOpen;
  component: RunButtonMenuOpen["component"];
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
    const isSynced = this.props.syncStatus === "synced" || forceOnline();
    const isSaved = !this.props.sequence.specialStatus;
    return isSynced && isSaved;
  }

  get varData() {
    return this.props.resources.sequenceMetas[this.props.sequence.uuid];
  }

  editBodyVariables = (variable: ParameterApplication) =>
    this.setState({
      bodyVariables: addOrEditParamApps(this.state.bodyVariables, variable)
    });

  /** Click actions for test button. */
  onClick = () => {
    const { dispatch, menuOpen, sequence, component } = this.props;
    const sequenceBody = sequence.body;
    const bodyVariables =
      mergeParameterApplications(this.varData, this.state.bodyVariables);
    this.setState({ bodyVariables });
    /** Open the variable menu if the sequence has parameter declarations. */
    isParameterized(sequenceBody) && dispatch(setMenuOpen(
      isMenuOpen(menuOpen, { component, uuid: sequence.uuid })
        ? closedMenu()
        : { component, uuid: sequence.uuid }));
    this.canTest
      /** Execute if sequence is synced, saved, and doesn't use parameters. */
      ? !isParameterized(sequenceBody) && execSequence(sequenceBody.id)
      : saveAndSyncWarning();
  };

  render() {
    const { menuOpen, sequence, component } = this.props;
    const hasMenu = isParameterized(this.props.sequence.body);
    const isOpen = isMenuOpen(menuOpen, { component, uuid: sequence.uuid });
    return <Popover className={"fb-button-popover-wrapper run-btn"} isOpen={isOpen}
      popoverClassName="parameter-assignment-menu-popover"
      target={<Test
        canTest={this.canTest}
        onClick={this.onClick}
        menuIsOpen={isOpen} />}
      content={hasMenu ?
        <ParameterAssignmentMenu
          dispatch={this.props.dispatch}
          canTest={this.canTest}
          resources={this.props.resources}
          varData={this.varData}
          editBodyVariables={this.editBodyVariables}
          bodyVariables={this.state.bodyVariables}
          sequence={this.props.sequence} />
        : undefined} />;
  }
}
