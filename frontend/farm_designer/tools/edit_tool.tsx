import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../designer_panel";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";
import { getPathArray } from "../../history";
import { TaggedTool, SpecialStatus } from "farmbot";
import { maybeFindToolById } from "../../resources/selectors";
import { SaveBtn } from "../../ui";
import { edit, destroy } from "../../api/crud";
import { history } from "../../history";
import { Panel } from "../panel_header";

export interface EditToolProps {
  findTool(id: string): TaggedTool | undefined;
  dispatch: Function;
}

export interface EditToolState {
  toolName: string;
}

export const mapStateToProps = (props: Everything): EditToolProps => ({
  findTool: (id: string) =>
    maybeFindToolById(props.resources.index, parseInt(id)),
  dispatch: props.dispatch,
});

export class RawEditTool extends React.Component<EditToolProps, EditToolState> {
  state: EditToolState = { toolName: this.tool ? this.tool.body.name || "" : "" };

  get stringyID() { return getPathArray()[4] || ""; }

  get tool() { return this.props.findTool(this.stringyID); }

  fallback = () => {
    history.push("/app/designer/tools");
    return <span>{t("Redirecting...")}</span>;
  }

  default = (tool: TaggedTool) => {
    const { dispatch } = this.props;
    const { toolName } = this.state;
    const panelName = "edit-tool";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Edit tool")}
        backTo={"/app/designer/tools"}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        <label>{t("Name")}</label>
        <input
          value={toolName}
          onChange={e => this.setState({ toolName: e.currentTarget.value })} />
        <SaveBtn
          onClick={() => {
            dispatch(edit(tool, { name: toolName }));
            history.push("/app/designer/tools");
          }}
          status={SpecialStatus.DIRTY} />
        <button
          className="fb-button red no-float"
          onClick={() => dispatch(destroy(tool.uuid))}>
          {t("Delete")}
        </button>
      </DesignerPanelContent>
    </DesignerPanel>;
  }

  render() {
    return this.tool ? this.default(this.tool) : this.fallback();
  }
}

export const EditTool = connect(mapStateToProps)(RawEditTool);
