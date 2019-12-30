import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../designer_panel";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";
import { SaveBtn } from "../../ui";
import { SpecialStatus } from "farmbot";
import { initSave } from "../../api/crud";
import { Panel } from "../panel_header";
import { history } from "../../history";

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

  newTool = (name: string) => {
    this.props.dispatch(initSave("Tool", { name }));
  };

  save = () => {
    this.newTool(this.state.toolName);
    history.push("/app/designer/tools");
  }

  get stockToolNames() {
    return [
      t("Seeder"),
      t("Watering Nozzle"),
      t("Weeder"),
      t("Soil Sensor"),
      t("Seed Bin"),
      t("Seed Tray"),
    ];
  }

  AddStockTools = () =>
    <div className="add-stock-tools">
      <label>{t("Add stock tools")}</label>
      <ul>
        {this.stockToolNames.map(n => <li key={n}>{n}</li>)}
      </ul>
      <button
        className="fb-button green"
        onClick={() => {
          this.stockToolNames.map(n => this.newTool(n));
          history.push("/app/designer/tools");
        }}>
        <i className="fa fa-plus" />
        {t("Stock Tools")}
      </button>
    </div>

  render() {
    const panelName = "add-tool";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Add new tool")}
        backTo={"/app/designer/tools"}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        <div className="add-new-tool">
          <label>{t("Tool Name")}</label>
          <input onChange={e =>
            this.setState({ toolName: e.currentTarget.value })} />
          <SaveBtn onClick={this.save} status={SpecialStatus.DIRTY} />
        </div>
        <this.AddStockTools />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddTool = connect(mapStateToProps)(RawAddTool);
