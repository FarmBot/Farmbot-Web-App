import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../designer_panel";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";
import { SaveBtn } from "../../ui";
import { SpecialStatus, FirmwareHardware } from "farmbot";
import { initSave } from "../../api/crud";
import { Panel } from "../panel_header";
import { history } from "../../history";
import { selectAllTools } from "../../resources/selectors";
import { betterCompact } from "../../util";
import {
  isExpressBoard, getFwHardwareValue
} from "../../devices/components/firmware_hardware_support";
import { getFbosConfig } from "../../resources/getters";

export interface AddToolProps {
  dispatch: Function;
  existingToolNames: string[];
  firmwareHardware: FirmwareHardware | undefined;
}

export interface AddToolState {
  toolName: string;
}

export const mapStateToProps = (props: Everything): AddToolProps => ({
  dispatch: props.dispatch,
  existingToolNames: betterCompact(selectAllTools(props.resources.index)
    .map(tool => tool.body.name)),
  firmwareHardware: getFwHardwareValue(getFbosConfig(props.resources.index)),
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

  stockToolNames = () => {
    switch (this.props.firmwareHardware) {
      case "arduino":
      case "farmduino":
      case "farmduino_k14":
      default:
        return [
          t("Seeder"),
          t("Watering Nozzle"),
          t("Weeder"),
          t("Soil Sensor"),
          t("Seed Bin"),
          t("Seed Tray"),
        ];
      case "farmduino_k15":
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
      case "express_k10":
        return [
          t("Seed Trough 1"),
          t("Seed Trough 2"),
        ];
    }
  }

  AddStockTools = () =>
    <div className="add-stock-tools">
      <label>{t("Add stock names")}</label>
      <ul>
        {this.stockToolNames().map(n => <li key={n}>{n}</li>)}
      </ul>
      <button
        className="fb-button green"
        onClick={() => {
          this.stockToolNames()
            .filter(n => !this.props.existingToolNames.includes(n))
            .map(n => this.newTool(n));
          history.push("/app/designer/tools");
        }}>
        <i className="fa fa-plus" />
        {t("Stock names")}
      </button>
    </div>

  render() {
    const panelName = "add-tool";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={isExpressBoard(this.props.firmwareHardware)
          ? t("Add new")
          : t("Add new tool")}
        backTo={"/app/designer/tools"}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        <div className="add-new-tool">
          <label>{t("Name")}</label>
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
