import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelTop, DesignerPanelContent
} from "../plants/designer_panel";
import { Everything } from "../../interfaces";
import { DesignerNavTabs, Panel } from "../panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic
} from "../../ui/empty_state_wrapper";
import { t } from "../../i18next_wrapper";
import { TaggedTool, TaggedToolSlotPointer } from "farmbot";
import {
  selectAllTools, selectAllToolSlotPointers
} from "../../resources/selectors";
import { Content } from "../../constants";
import { history } from "../../history";
import { Row, Col } from "../../ui";
import { botPositionLabel } from "../map/layers/farmbot/bot_position_label";

export interface ToolsProps {
  tools: TaggedTool[];
  toolSlots: TaggedToolSlotPointer[];
  dispatch: Function;
}

export interface ToolsState {
  searchTerm: string;
}

export const mapStateToProps = (props: Everything): ToolsProps => ({
  tools: selectAllTools(props.resources.index),
  toolSlots: selectAllToolSlotPointers(props.resources.index),
  dispatch: props.dispatch,
});

@connect(mapStateToProps)
export class Tools extends React.Component<ToolsProps, ToolsState> {
  state: ToolsState = { searchTerm: "" };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: currentTarget.value });
  }

  getToolName = (toolId: number | undefined): string | undefined => {
    const foundTool = this.props.tools.filter(tool => tool.body.id === toolId)[0];
    return foundTool ? foundTool.body.name : undefined;
  };

  render() {
    const panelName = "tools";
    return <DesignerPanel
      panelName={panelName}
      panelColor={"gray"}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Tools}
        linkTo={"/app/designer/tools/add"}
        title={t("Add tool")}>
        <input type="text" onChange={this.update}
          placeholder={t("Search your tools...")} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"tools"}>
        <EmptyStateWrapper
          notEmpty={this.props.tools.length > 0}
          graphic={EmptyStateGraphic.sequences}
          title={t("Add a tool")}
          text={Content.NO_TOOLS}
          colorScheme={"tools"}>
          <div>
            <label>{t("tool slots")}</label>
            {this.props.toolSlots
              .filter(p => (this.getToolName(p.body.tool_id) || "").toLowerCase()
                .includes(this.state.searchTerm.toLowerCase()))
              .map(toolSlot =>
                <ToolSlotInventoryItem key={toolSlot.uuid}
                  toolSlot={toolSlot}
                  getToolName={this.getToolName} />)}
            <br />
            <label>{t("inactive tools")}</label>
            {this.props.tools
              .filter(tool => tool.body.name && tool.body.name.toLowerCase()
                .includes(this.state.searchTerm.toLowerCase()))
              .filter(tool => tool.body.status === "inactive")
              .map(tool =>
                <ToolInventoryItem key={tool.uuid}
                  toolId={tool.body.id}
                  toolName={tool.body.name || t("Unnammed tool")} />)}
          </div>
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

interface ToolSlotInventoryItemProps {
  toolSlot: TaggedToolSlotPointer;
  getToolName(toolId: number | undefined): string | undefined;
}

const ToolSlotInventoryItem = (props: ToolSlotInventoryItemProps) => {
  const { x, y, z, tool_id } = props.toolSlot.body;
  return <Row>
    <Col xs={7}>
      <p onClick={() => history.push(`/app/designer/tools/${tool_id}`)}>
        {props.getToolName(tool_id) || t("No tool")}
      </p>
    </Col>
    <Col xs={5}>
      <p style={{ float: "right" }}>{botPositionLabel({ x, y, z })}</p>
    </Col>
  </Row>;
};

interface ToolInventoryItemProps {
  toolName: string;
  toolId: number | undefined;
}

const ToolInventoryItem = (props: ToolInventoryItemProps) =>
  <Row>
    <Col xs={12}>
      <p onClick={() => history.push(`/app/designer/tools/${props.toolId}`)}>
        {t(props.toolName)}
      </p>
    </Col>
  </Row>;
