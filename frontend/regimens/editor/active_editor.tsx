import React from "react";
import {
  RegimenNameInput, editRegimenVariables, RegimenButtonGroup,
  OpenSchedulerButton,
} from "./regimen_edit_components";
import { ActiveEditorProps, ActiveEditorState } from "./interfaces";
import { LocalsList } from "../../sequences/locals_list/locals_list";
import {
  AllowedVariableNodes,
} from "../../sequences/locals_list/locals_list_support";
import { ErrorBoundary } from "../../error_boundary";
import { RegimenRows } from "./regimen_rows";

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
      allowedVariableNodes={AllowedVariableNodes.parameter} />;
  }

  render() {
    return <div className="regimen-editor-content">
      <div id="regimen-editor-tools" className="regimen-editor-tools">
        <RegimenButtonGroup {...this.regimenProps} />
        <RegimenNameInput {...this.regimenProps} />
        <ErrorBoundary>
          <this.LocalsList />
        </ErrorBoundary>
        <hr />
      </div>
      <OpenSchedulerButton />
      <ErrorBoundary>
        <RegimenRows {...this.regimenProps}
          calendar={this.props.calendar}
          varsCollapsed={this.state.variablesCollapsed}
          resources={this.props.resources} />
      </ErrorBoundary>
    </div>;
  }
}
