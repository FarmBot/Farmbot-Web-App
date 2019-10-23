import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../plants/designer_panel";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";
import { getPathArray } from "../../history";
import { TaggedTool, SpecialStatus } from "farmbot";
import { maybeFindToolById } from "../../resources/selectors";
import { SaveBtn } from "../../ui";
import { edit } from "../../api/crud";
import { history } from "../../history";

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

  default = (tool: TaggedTool) =>
    <DesignerPanel panelName={"tool"} panelColor={"gray"}>
      <DesignerPanelHeader
        panelName={"tool"}
        title={`${t("Edit")} ${tool.body.name}`}
        backTo={"/app/designer/tools"}
        panelColor={"gray"} />
      <DesignerPanelContent panelName={"tools"}>
        <label>{t("Tool Name")}</label>
        <input
          value={this.state.toolName}
          onChange={e => this.setState({ toolName: e.currentTarget.value })} />
        <SaveBtn
          onClick={() => {
            this.props.dispatch(edit(tool, { name: this.state.toolName }));
            history.push("/app/designer/tools");
          }}
          status={SpecialStatus.DIRTY} />
      </DesignerPanelContent>
    </DesignerPanel>;

  render() {
    return this.tool ? this.default(this.tool) : this.fallback();
  }
}

export const EditTool = connect(mapStateToProps)(RawEditTool);
