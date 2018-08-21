import * as React from "react";
import { Row, Col, Widget, WidgetBody, WidgetHeader } from "../../ui/index";
import { t } from "i18next";
import { ToolListProps } from "../interfaces";
import { TaggedTool } from "farmbot";
import { ToolTips } from "../../constants";

export class ToolList extends React.Component<ToolListProps, {}> {
  render() {
    const toggle = () => this.props.toggle();
    const { tools } = this.props;

    return <Widget>
      <WidgetHeader helpText={ToolTips.TOOL_LIST} title={t("Tools")}>
        <button
          className="fb-button gray"
          onClick={toggle}>
          {t("Edit")}
        </button>
      </WidgetHeader>
      <WidgetBody>
        <Row>
          <Col xs={8}>
            <label>{t("Tool Name")}</label>
          </Col>
          <Col xs={4}>
            <label>{t("Status")}</label>
          </Col>
        </Row>
        {tools.map((tool: TaggedTool) => {
          return <Row key={tool.uuid}>
            <Col xs={8}>
              {tool.body.name || "Name not found"}
            </Col>
            <Col xs={4}>
              {this.props.isActive(tool) ? t("active") : t("inactive")}
            </Col>
          </Row>;
        })}
      </WidgetBody>
    </Widget>;
  }
}
