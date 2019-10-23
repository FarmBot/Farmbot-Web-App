import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../plants/designer_panel";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";
import { SaveBtn } from "../../ui";
import { SpecialStatus } from "farmbot";
import { initSave } from "../../api/crud";

export interface AddToolProps {
  dispatch: Function;
}

export interface AddToolState {
  toolName: string;
}

export const mapStateToProps = (props: Everything): AddToolProps => ({
  dispatch: props.dispatch,
});

export class RawAddTool extends React.Component<AddToolProps, AddToolState> {
  state: AddToolState = { toolName: "" };
  render() {
    return <DesignerPanel panelName={"tool"} panelColor={"gray"}>
      <DesignerPanelHeader
        panelName={"tool"}
        title={t("Add new tool")}
        backTo={"/app/designer/tools"}
        panelColor={"gray"} />
      <DesignerPanelContent panelName={"tools"}>
        <label>{t("Tool Name")}</label>
        <input
          onChange={e => this.setState({ toolName: e.currentTarget.value })} />
        <SaveBtn
          onClick={() =>
            this.props.dispatch(initSave("Tool", { name: this.state.toolName }))}
          status={SpecialStatus.DIRTY} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddTool = connect(mapStateToProps)(RawAddTool);
