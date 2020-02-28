import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../designer_panel";
import { t } from "../../i18next_wrapper";
import { getPathArray } from "../../history";
import { TaggedToolSlotPointer } from "farmbot";
import { edit, save, destroy } from "../../api/crud";
import { history } from "../../history";
import { Panel } from "../panel_header";
import { SlotEditRows } from "./tool_slot_edit_components";
import { moveAbs } from "../../devices/actions";
import {
  isExpressBoard,
} from "../../devices/components/firmware_hardware_support";
import { EditToolSlotProps, mapStateToPropsEdit } from "./map_to_props_add_edit";

export class RawEditToolSlot extends React.Component<EditToolSlotProps> {

  get stringyID() { return getPathArray()[4] || ""; }
  get toolSlot() { return this.props.findToolSlot(this.stringyID); }
  get tool() {
    return this.toolSlot && this.props.findTool(this.toolSlot.body.tool_id || 0);
  }

  updateSlot = (toolSlot: TaggedToolSlotPointer) =>
    (update: Partial<TaggedToolSlotPointer["body"]>) => {
      this.props.dispatch(edit(toolSlot, update));
      this.props.dispatch(save(toolSlot.uuid));
    }

  render() {
    const { toolSlot } = this;
    !toolSlot && history.push("/app/designer/tools");
    const panelName = "edit-tool-slot";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Edit slot")}
        backTo={"/app/designer/tools"}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        {toolSlot
          ? <div className={"edit-tool-slot-content-wrapper"}>
            <SlotEditRows
              isExpress={isExpressBoard(this.props.firmwareHardware)}
              toolSlot={toolSlot}
              tools={this.props.tools}
              tool={this.tool}
              botPosition={this.props.botPosition}
              xySwap={this.props.xySwap}
              quadrant={this.props.quadrant}
              isActive={this.props.isActive}
              updateToolSlot={this.updateSlot(toolSlot)} />
            <button
              className="fb-button gray no-float"
              title={t("move to this location")}
              onClick={() => {
                const x = toolSlot.body.gantry_mounted
                  ? this.props.botPosition.x ?? toolSlot.body.x
                  : toolSlot.body.x;
                const { y, z } = toolSlot.body;
                moveAbs({ x, y, z });
              }}>
              {t("Move FarmBot to slot location")}
            </button>
            <button
              className="fb-button red no-float"
              title={t("Delete")}
              onClick={() => this.props.dispatch(destroy(toolSlot.uuid))}>
              {t("Delete")}
            </button>
          </div>
          : <span>{t("Redirecting")}...</span>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditToolSlot = connect(mapStateToPropsEdit)(RawEditToolSlot);
