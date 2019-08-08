import * as React from "react";
import { Row, Col, Widget, WidgetBody, WidgetHeader } from "../../ui";

import { ToolListAndFormProps } from "../interfaces";
import { TaggedTool } from "farmbot";
import { ToolTips } from "../../constants";
import { t } from "../../i18next_wrapper";

enum ColWidth {
  toolName = 8,
  status = 4,
}

export class ToolList extends React.Component<ToolListAndFormProps, {}> {

  ToolListItem = (tool: TaggedTool) => {
    return <Row key={tool.uuid}>
      <Col xs={ColWidth.toolName}>
        {tool.body.name || "Name not found"}
      </Col>
      <Col xs={ColWidth.status}>
        {this.props.isActive(tool) ? t("active") : t("inactive")}
      </Col>
    </Row>;
  }

  render() {
    const { tools, toggle } = this.props;

    return <Widget className="tool-list">
      <WidgetHeader helpText={ToolTips.TOOL_LIST} title={t("Tools and Seed Containers")}>
        <button
          className="fb-button gray"
          onClick={toggle}>
          {t("Edit")}
        </button>
      </WidgetHeader>
      <WidgetBody>
        <Row>
          <Col xs={ColWidth.toolName}>
            <label>{t("Name")}</label>
          </Col>
          <Col xs={ColWidth.status}>
            <label>{t("Status")}</label>
          </Col>
        </Row>
        {tools.map(this.ToolListItem)}
      </WidgetBody>
    </Widget>;
  }
}
