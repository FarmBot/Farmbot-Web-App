import * as React from "react";
import { Widget, WidgetHeader } from "../../ui/index";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import { WebcamPanelProps } from "./interfaces";
const noop = () => alert("TODO");

export function Show(props: WebcamPanelProps) {
  const unsaved = !!props.feeds.filter(x => x.specialStatus !== undefined).length;
  return (
    <Widget>
      <WidgetHeader title="Webcam" helpText={ToolTips.WEBCAM}>
        <button
          className="fb-button gray"
          onClick={props.onToggle}>
          {t("Edit")}
          {unsaved ? "*" : ""}
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
