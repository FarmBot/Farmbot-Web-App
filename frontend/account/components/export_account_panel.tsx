import * as React from "react";
import { Widget, WidgetHeader, WidgetBody, Row, Col } from "../../ui";
import { Content } from "../../constants";
import { t } from "../../i18next_wrapper";

export function ExportAccountPanel(props: { onClick: () => void }) {
  return <Widget>
    <WidgetHeader title={t("Export Account Data")} />
    <WidgetBody>
      <div>
        {t(Content.EXPORT_DATA_DESC)}
      </div>
      <form>
        <Row>
          <Col xs={8}>
            <label>
              {t("Send Account Export File (Email)")}
            </label>
          </Col>
          <Col xs={4}>
            <button onClick={props.onClick} className="green fb-button" type="button" >
              {t("Export")}
            </button>
          </Col>
        </Row>
      </form>
    </WidgetBody>
  </Widget>;
}
