import * as React from "react";
import { Widget, WidgetHeader } from "../../ui/index";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import { WebcamPanelProps } from "./interfaces";
import { KeyValEditRow } from "../key_val_edit_row";
import { SpecialStatus } from "../../resources/tagged_resources";

export function Edit(props: WebcamPanelProps) {
  const rows = props.feeds.map(wcf => {
    return <KeyValEditRow key={wcf.uuid}
      onClick={() => props.destroy(wcf)}
      onLabelChange={(e) => props.edit(wcf, { name: e.currentTarget.value })}
      onValueChange={(e) => props.edit(wcf, { url: e.currentTarget.value })}
      disabled={true}
      value={wcf.body.url}
      valuePlaceholder={"HTTP://..."}
      label={wcf.body.name}
      labelPlaceholder={"Feed Name"}
      valueType="string" />;
  });
  const unsaved = props
    .feeds
    .filter(x => x.specialStatus === SpecialStatus.DIRTY);
  return (
    <Widget>
      <WidgetHeader title="Edit" helpText={ToolTips.WEBCAM}>
        <button
          className="fb-button green"
          onClick={props.init}>
          <i className="fa fa-plus" />
        </button>
        <button
          className="fb-button green"
          onClick={() => { unsaved.map(x => props.save(x)); }}>
          {t("Save")}{unsaved.length > 0 ? "*" : ""}
        </button>
        <button
          className="fb-button gray"
          onClick={props.onToggle}>
          {t("Show")}
        </button>
      </WidgetHeader>
      <div className="widget-body">
        {rows}
      </div>
    </Widget>
  );
}
