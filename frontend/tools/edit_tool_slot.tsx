import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { TaggedToolSlotPointer, SpecialStatus } from "farmbot";
import { edit, save, destroy } from "../api/crud";
import { Panel } from "../farm_designer/panel_header";
import { SlotEditRows } from "./tool_slot_edit_components";
import { hasUTM } from "../settings/firmware/firmware_hardware_support";
import { mapStateToPropsEdit } from "./state_to_props";
import { EditToolSlotProps, EditToolSlotState } from "./interfaces";
import { setToolHover } from "../farm_designer/map/layers/tool_slots/tool_graphics";
import { Popover } from "../ui";
import { Path } from "../internal_urls";
import { Navigate } from "react-router";

export class RawEditToolSlot
  extends React.Component<EditToolSlotProps, EditToolSlotState> {
  state: EditToolSlotState = { saveError: true };

  get stringyID() { return Path.getSlug(Path.toolSlots()); }
  get toolSlot() { return this.props.findToolSlot(this.stringyID); }
  get tool() {
    return this.toolSlot && this.props.findTool(this.toolSlot.body.tool_id || 0);
  }

  componentWillUnmount = () => this.props.dispatch(setToolHover(undefined));

  updateSlot = (toolSlot: TaggedToolSlotPointer) =>
    (update: Partial<TaggedToolSlotPointer["body"]>) => {
      this.props.dispatch(edit(toolSlot, update));
      this.props.dispatch(save(toolSlot.uuid))
        .then(() => this.setState({ saveError: false }))
        .catch(() => this.setState({ saveError: true }));
    };

  render() {
    const { toolSlot } = this;
    const toolsPath = Path.tools();
    const toolSlotsPath = Path.toolSlots();
    const panelName = "edit-tool-slot";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      {!toolSlot && Path.startsWith(toolSlotsPath) && <Navigate to={toolsPath} />}
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Edit slot")}
        backTo={toolsPath}
        panel={Panel.Tools}>
        <div className={"tool-action-btn-group"}>
          {toolSlot?.specialStatus == SpecialStatus.DIRTY &&
            this.state.saveError &&
            <Popover className={"save-error"}
              target={<i className={"fa fa-exclamation-triangle"}
                title={t("Unable to save changes.")} />}
              content={<p>{t("Unable to save changes.")}</p>} />}
          {toolSlot && <i
            className={"fa fa-trash fb-icon-button invert"}
            title={t("Delete")}
            onClick={() => this.props.dispatch(destroy(toolSlot.uuid))} />}
        </div>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={panelName}>
        {toolSlot
          ? <div className={"edit-tool-slot-content-wrapper"}>
            <SlotEditRows
              noUTM={!hasUTM(this.props.firmwareHardware)}
              toolSlot={toolSlot}
              tools={this.props.tools}
              tool={this.tool}
              botPosition={this.props.botPosition}
              movementState={this.props.movementState}
              botOnline={this.props.botOnline}
              dispatch={this.props.dispatch}
              arduinoBusy={this.props.arduinoBusy}
              defaultAxes={this.props.defaultAxes}
              toolTransformProps={this.props.toolTransformProps}
              isActive={this.props.isActive}
              updateToolSlot={this.updateSlot(toolSlot)} />
            <ul className="meta">
              {Object.entries(toolSlot.body.meta).map(([key, value]) => {
                switch (key) {
                  case "tool_direction":
                    return <div key={key}
                      className={`meta-${key}-not-displayed`} />;
                  default:
                    return <li key={key}>
                      <label>{key}</label>
                      <div>{value}</div>
                    </li>;
                }
              })}
            </ul>
          </div>
          : <span>{t("Redirecting")}...</span>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditToolSlot = connect(mapStateToPropsEdit)(RawEditToolSlot);
// eslint-disable-next-line import/no-default-export
export default EditToolSlot;
