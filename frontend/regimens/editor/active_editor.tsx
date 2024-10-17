import React from "react";
import {
  editRegimenVariables, OpenSchedulerButton,
} from "./regimen_edit_components";
import { ActiveEditorProps, ActiveEditorState } from "./interfaces";
import {
  LocalsList, removeVariable,
} from "../../sequences/locals_list/locals_list";
import {
  AllowedVariableNodes,
} from "../../sequences/locals_list/locals_list_support";
import { ErrorBoundary } from "../../error_boundary";
import { RegimenRows } from "./regimen_rows";
import { t } from "../../i18next_wrapper";
import { SectionHeader } from "../../sequences/sequence_editor_middle_active";
import { Collapse } from "@blueprintjs/core";

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
      removeVariable={removeVariable({
        dispatch: this.props.dispatch,
        resource: regimen,
        variableData: this.props.variableData,
      })}
      labelOnly={true}
      allowedVariableNodes={AllowedVariableNodes.parameter} />;
  };

  render() {
    return <div className="regimen-editor-content grid">
      <div id="regimen-editor-tools" className="regimen-editor-tools">
        <SectionHeader title={t("Variables")}
          count={Object.values(this.props.variableData)
            .filter(v => v?.celeryNode.kind == "parameter_declaration")
            .length}
          collapsed={this.state.variablesCollapsed}
          toggle={this.toggleVarShow} />
        <Collapse isOpen={!this.state.variablesCollapsed}>
          <ErrorBoundary>
            <this.LocalsList />
          </ErrorBoundary>
        </Collapse>
      </div>
      <OpenSchedulerButton />
      <ErrorBoundary>
        <RegimenRows {...this.regimenProps}
          calendar={this.props.calendar}
          resources={this.props.resources} />
      </ErrorBoundary>
    </div>;
  }
}
