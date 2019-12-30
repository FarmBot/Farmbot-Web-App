import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../designer_panel";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";
import { getPathArray } from "../../history";
import { TaggedToolSlotPointer, TaggedTool } from "farmbot";
import { edit, save, destroy } from "../../api/crud";
import { history } from "../../history";
import { Panel } from "../panel_header";
import {
  maybeFindToolSlotById, selectAllTools, maybeFindToolById
} from "../../resources/selectors";
import { BotPosition } from "../../devices/interfaces";
import { validBotLocationData } from "../../util";
import { SlotEditRows } from "./tool_slot_edit_components";
import { moveAbs } from "../../devices/actions";

export interface EditToolSlotProps {
  findToolSlot(id: string): TaggedToolSlotPointer | undefined;
  tools: TaggedTool[];
  findTool(id: number): TaggedTool | undefined;
  dispatch: Function;
  botPosition: BotPosition;
}

export const mapStateToProps = (props: Everything): EditToolSlotProps => ({
  findToolSlot: (id: string) =>
    maybeFindToolSlotById(props.resources.index, parseInt(id)),
  tools: selectAllTools(props.resources.index),
  findTool: (id: number) => maybeFindToolById(props.resources.index, id),
  dispatch: props.dispatch,
  botPosition: validBotLocationData(props.bot.hardware.location_data).position,
});

export class RawEditToolSlot extends React.Component<EditToolSlotProps> {

  get stringyID() { return getPathArray()[4] || ""; }
  get toolSlot() { return this.props.findToolSlot(this.stringyID); }
  get tool() {
    return this.toolSlot && this.props.findTool(this.toolSlot.body.tool_id || 0);
  }

  fallback = () => {
    history.push("/app/designer/tools");
    return <span>{t("Redirecting...")}</span>;
  }

  updateSlot = (toolSlot: TaggedToolSlotPointer) =>
    (update: Partial<TaggedToolSlotPointer["body"]>) => {
      this.props.dispatch(edit(toolSlot, update));
      this.props.dispatch(save(toolSlot.uuid));
    }

  default = (toolSlot: TaggedToolSlotPointer) => {
    const panelName = "edit-tool-slot";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Edit tool slot")}
        backTo={"/app/designer/tools"}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        <SlotEditRows
          toolSlot={toolSlot}
          tools={this.props.tools}
          tool={this.tool}
          botPosition={this.props.botPosition}
          updateToolSlot={this.updateSlot(toolSlot)} />
        <button
          className="fb-button gray no-float"
          onClick={() => {
            const { x, y, z } = toolSlot.body;
            moveAbs({ x, y, z });
          }}>
          {t("Move FarmBot to tool slot location")}
        </button>
        <button
          className="fb-button red no-float"
          onClick={() => this.props.dispatch(destroy(toolSlot.uuid))}>
          {t("Delete")}
        </button>
      </DesignerPanelContent>
    </DesignerPanel>;
  }

  render() {
    return this.toolSlot ? this.default(this.toolSlot) : this.fallback();
  }
}

export const EditToolSlot = connect(mapStateToProps)(RawEditToolSlot);
