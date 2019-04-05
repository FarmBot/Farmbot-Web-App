import * as React from "react";
import { ToolListAndFormProps } from "../interfaces";

import {
  Row,
  Col,
  Widget,
  WidgetBody,
  WidgetHeader,
  BlurableInput,
  SaveBtn
} from "../../ui";
import { getArrayStatus } from "../../resources/tagged_resources";
import { edit, destroy, init, saveAll } from "../../api/crud";
import { ToolTips } from "../../constants";
import { TaggedTool } from "farmbot";
import { t } from "../../i18next_wrapper";

export class ToolForm extends React.Component<ToolListAndFormProps, {}> {
  get newToolName() { return t("Tool ") + (this.props.tools.length + 1); }

  newTool = (name = this.newToolName) => {
    this.props.dispatch(init("Tool", { name }));
  };

  stockTools = () => {
    this.newTool(t("Seeder"));
    this.newTool(t("Watering Nozzle"));
    this.newTool(t("Weeder"));
    this.newTool(t("Soil Sensor"));
    this.newTool(t("Seed Bin"));
    this.newTool(t("Seed Tray"));
  }

  HeaderButtons = () => {
    const { dispatch, tools, toggle } = this.props;
    const specialStatus = getArrayStatus(tools);
    return <div>
      <button
        className="fb-button gray"
        onClick={toggle}
        disabled={!!specialStatus}>
        {t("Back")}
      </button>
      <SaveBtn
        status={specialStatus}
        onClick={() => dispatch(saveAll(tools, toggle))} />
      <button
        className="fb-button green"
        onClick={() => this.newTool()}>
        <i className="fa fa-plus" />
      </button>
      <button
        className="fb-button green"
        onClick={this.stockTools}>
        <i className="fa fa-plus" style={{ marginRight: "0.5rem" }} />
        {t("Stock Tools")}
      </button>
    </div>;
  }

  ToolForm = (tool: TaggedTool, index: number) => {
    const { dispatch, isActive } = this.props;
    const inSlotClass = isActive(tool) ? "pseudo-disabled" : "";
    return <Row key={index}>
      <Col xs={10}>
        <BlurableInput
          id={(tool.body.id || "Error getting ID").toString()}
          value={tool.body.name || "Error getting Name"}
          onCommit={e =>
            dispatch(edit(tool, { name: e.currentTarget.value }))} />
      </Col>
      <Col xs={2}>
        <button
          className={`fb-button red ${inSlotClass} del-button`}
          title={isActive(tool) ? t("in slot") : ""}
          onClick={() => dispatch(destroy(tool.uuid))}>
          <i className="fa fa-times"></i>
        </button>
      </Col>
    </Row>;
  }

  render() {
    return <Widget className="tools-widget">
      <WidgetHeader helpText={ToolTips.TOOL_LIST} title="Tools">
        <this.HeaderButtons />
      </WidgetHeader>
      <WidgetBody>
        <Row>
          <Col xs={12}>
            <label>{t("Tool Name")}</label>
          </Col>
        </Row>
        {this.props.tools.map(this.ToolForm)}
      </WidgetBody>
    </Widget>;
  }
}
