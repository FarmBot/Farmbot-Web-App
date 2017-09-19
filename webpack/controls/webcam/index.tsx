import * as React from "react";
import { t } from "i18next";
import { Widget, WidgetHeader } from "../../ui/index";
import { ToolTips } from "../../constants";

type S = {};
type P = {};
const noop = () => alert("TODO");
export class WebcamPanel extends React.Component<P, S> {

  state: S = {};

  render() {
    return (
      <Widget>
        <WidgetHeader title="Webcam" helpText={ToolTips.WEBCAM}>
          <button
            className="fb-button green"
            onClick={noop}>
            {t("Save")}*
          </button>
          <button
            className="fb-button gray"
            onClick={noop}>
            {t("Edit")}
          </button>
        </WidgetHeader>
        <div className="widget-body">
          <label>{t("Set Webcam URL:")}</label>
          <input
            type="text"
            onChange={noop}
            placeholder="https://"
            value={undefined}
            className="webcam-url-input" />
        </div>
      </Widget>
    );
  }
}
