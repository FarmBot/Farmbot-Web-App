import * as React from "react";
import { RegimenNameInput } from "./regimen_name_input";
import { ActiveEditorProps, ActiveEditorState } from "./interfaces";
import { push } from "../../history";
import {
  RegimenItem, CalendarRow, RegimenItemCalendarRow, RegimenProps
} from "../interfaces";
import { TaggedRegimen, ScopeDeclarationBodyItem } from "farmbot";
import { defensiveClone } from "../../util";
import { overwrite, save, destroy } from "../../api/crud";
import { SaveBtn } from "../../ui";
import { CopyButton } from "./copy_button";
import { LocalsList } from "../../sequences/locals_list/locals_list";
import {
  AllowedVariableNodes, VariableNode
} from "../../sequences/locals_list/locals_list_support";
import { addOrEditBodyVariables } from "../../sequences/locals_list/handle_select";
import { t } from "../../i18next_wrapper";
import { Actions } from "../../constants";
import { reduceVariables } from "../../sequences/locals_list/variable_support";
import { determineDropdown, withPrefix } from "../../resources/sequence_meta";
import { ResourceIndex } from "../../resources/interfaces";

/**
 * The bottom half of the regimen editor panel (when there's something to
 * actually edit).
 */
export class ActiveEditor
  extends React.Component<ActiveEditorProps, ActiveEditorState> {
  state: ActiveEditorState = { variablesCollapsed: false };

  get regimenProps() {
    return { regimen: this.props.regimen, dispatch: this.props.dispatch };
  }

  toggleVarShow = () =>
    this.setState({ variablesCollapsed: !this.state.variablesCollapsed });

  LocalsList = () => {
    const { regimen } = this.props;
    return <LocalsList
      locationDropdownKey={JSON.stringify(regimen)}
      bodyVariables={regimen.body.body}
      variableData={this.props.variableData}
      sequenceUuid={regimen.uuid}
      resources={this.props.resources}
      onChange={editRegimenVariables(this.regimenProps)(regimen.body.body)}
      collapsible={true}
      collapsed={this.state.variablesCollapsed}
      toggleVarShow={this.toggleVarShow}
      allowedVariableNodes={AllowedVariableNodes.parameter}
      shouldDisplay={this.props.shouldDisplay} />;
  }

  render() {
    return <div className="regimen-editor-content">
      <div id="regimen-editor-tools" className="regimen-editor-tools">
        <RegimenButtonGroup {...this.regimenProps} />
        <RegimenNameInput {...this.regimenProps} />
        <this.LocalsList />
        <hr />
      </div>
      <OpenSchedulerButton dispatch={this.props.dispatch} />
      <RegimenRows {...this.regimenProps}
        calendar={this.props.calendar}
        varsCollapsed={this.state.variablesCollapsed}
        resources={this.props.resources} />
    </div>;
  }
}

export const OpenSchedulerButton = (props: { dispatch: Function }) =>
  <button className="open-bulk-scheduler-btn fb-button gray"
    onClick={() => props.dispatch({
      type: Actions.SET_SCHEDULER_STATE, payload: true
    })}>
    {t("Schedule item")}
  </button>;

export const editRegimenVariables = (props: RegimenProps) =>
  (bodyVariables: VariableNode[]) =>
    (variable: ScopeDeclarationBodyItem) => {
      const copy = defensiveClone(props.regimen);
      copy.body.body = addOrEditBodyVariables(bodyVariables, variable);
      props.dispatch(overwrite(props.regimen, copy.body));
    };

const RegimenButtonGroup = (props: RegimenProps) =>
  <div className="button-group">
    <SaveBtn
      status={props.regimen.specialStatus}
      onClick={() => props.dispatch(save(props.regimen.uuid))} />
    <CopyButton regimen={props.regimen} dispatch={props.dispatch} />
    <button className="fb-button red"
      onClick={() => props.dispatch(destroy(props.regimen.uuid))
        .then(() => push("/app/regimens/"))}>
      {t("Delete")}
    </button>
  </div>;

/** Make room for the regimen header variable form when necessary. */
const regimenSectionHeight =
  (regimen: TaggedRegimen, varsCollapsed: boolean) => {
    let subHeight = 200;
    const variables = regimen.body.body.length > 0;
    if (variables) { subHeight = 500; }
    if (varsCollapsed) { subHeight = 300; }
    const variablesDiv = document.getElementById("regimen-editor-tools");
    if (variablesDiv) { subHeight = 200 + variablesDiv.offsetHeight; }
    return `calc(100vh - ${subHeight}px)`;
  };

interface RegimenRowsProps {
  regimen: TaggedRegimen;
  calendar: CalendarRow[];
  dispatch: Function;
  varsCollapsed: boolean;
  resources: ResourceIndex;
}

const RegimenRows = (props: RegimenRowsProps) =>
  <div className="regimen" style={{
    height: regimenSectionHeight(props.regimen, props.varsCollapsed)
  }}>
    {props.calendar.map(regimenDay(props.dispatch, props.resources))}
  </div>;

const regimenDay = (dispatch: Function, resources: ResourceIndex) =>
  (group: CalendarRow, dayIndex: number) =>
    <div className="regimen-day" key={dayIndex}>
      <label> {t("Day {{day}}", { day: group.day })} </label>
      {group.items.map(regimenItemRow(dispatch, resources, dayIndex))}
    </div>;

const regimenItemRow = (
  dispatch: Function, resources: ResourceIndex, dayIndex: number
) =>
  (row: RegimenItemCalendarRow, itemIndex: number) =>
    <div className={`${row.color} regimen-event`}
      key={`${dayIndex}.${itemIndex}`}>
      <span className="regimen-event-title">{row.name}</span>
      <span className="regimen-event-time">{row.hhmm}</span>
      <DisplayVarValue row={row} resources={resources} />
      <i className="fa fa-trash regimen-control" onClick={() =>
        dispatch(removeRegimenItem(row.item, row.regimen))} />
    </div>;

const removeRegimenItem = (item: RegimenItem, r: TaggedRegimen) => {
  const copy = defensiveClone(r);
  copy.body.regimen_items = r.body.regimen_items.filter(x => x !== item);
  return overwrite(r, copy.body);
};

interface DisplayVarValueProps {
  row: RegimenItemCalendarRow;
  resources: ResourceIndex;
}

const DisplayVarValue = (props: DisplayVarValueProps) => {
  const { variable, regimen } = props.row;
  if (variable) {
    const variableNode = reduceVariables(regimen.body.body)[variable];
    if (variableNode) {
      return <span className="regimen-event-variable">
        {withPrefix(determineDropdown(variableNode, props.resources).label)}
      </span>;
    }
  }
  return <span />;
};
