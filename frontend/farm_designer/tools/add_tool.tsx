import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../designer_panel";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";
import { SaveBtn, FBSelect, DropDownItem } from "../../ui";
import { SpecialStatus } from "farmbot";
import { initSave } from "../../api/crud";
import { Panel } from "../panel_header";
import { history } from "../../history";
import { error } from "../../toast/toast";

enum Model { genesis14 = "genesis14", genesis15 = "genesis15", express = "express" }

const MODEL_DDI_LOOKUP = (): { [x: string]: DropDownItem } => ({
  [Model.genesis14]: { label: t("Genesis v1.2-v1.4"), value: Model.genesis14 },
  [Model.genesis15]: { label: t("Genesis v1.5+"), value: Model.genesis15 },
  [Model.express]: { label: t("Express"), value: Model.express },
});

export interface AddToolProps {
  dispatch: Function;
}

export interface AddToolState {
  toolName: string;
  model: Model | undefined;
}

export const mapStateToProps = (props: Everything): AddToolProps => ({
  dispatch: props.dispatch,
});

export class RawAddTool extends React.Component<AddToolProps, AddToolState> {
  state: AddToolState = { toolName: "", model: undefined };

  newTool = (name: string) => {
    this.props.dispatch(initSave("Tool", { name }));
  };

  save = () => {
    this.newTool(this.state.toolName);
    history.push("/app/designer/tools");
  }

  stockToolNames = (model: Model) => {
    switch (model) {
      case Model.genesis14:
        return [
          t("Seeder"),
          t("Watering Nozzle"),
          t("Weeder"),
          t("Soil Sensor"),
          t("Seed Bin"),
          t("Seed Tray"),
        ];
      case Model.genesis15:
        return [
          t("Seeder"),
          t("Watering Nozzle"),
          t("Weeder"),
          t("Soil Sensor"),
          t("Seed Bin"),
          t("Seed Tray"),
          t("Seed Trough 1"),
          t("Seed Trough 2"),
        ];
      case Model.express:
        return [
          t("Seed Trough 1"),
          t("Seed Trough 2"),
        ];
    }
  }

  AddStockTools = () =>
    <div className="add-stock-tools">
      <label>{t("Add stock tools")}</label>
      <FBSelect
        customNullLabel={t("Choose model")}
        list={Object.values(MODEL_DDI_LOOKUP())}
        selectedItem={this.state.model
          ? MODEL_DDI_LOOKUP()[this.state.model]
          : undefined}
        onChange={ddi => this.setState({ model: ddi.value as Model })}
      />
      {this.state.model &&
        <ul>
          {this.stockToolNames(this.state.model).map(n => <li key={n}>{n}</li>)}
        </ul>}
      <button
        className="fb-button green"
        onClick={() => {
          if (this.state.model) {
            this.stockToolNames(this.state.model).map(n => this.newTool(n));
            history.push("/app/designer/tools");
          } else {
            error(t("Please choose a FarmBot model."));
          }
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
