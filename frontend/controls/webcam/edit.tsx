import React from "react";
import { WebcamPanelProps } from "./interfaces";
import { KeyValEditRow } from "./key_val_edit_row";
import { SpecialStatus, TaggedWebcamFeed } from "farmbot";
import { sortBy } from "lodash";
import { t } from "../../i18next_wrapper";

export function sortedFeeds(feeds: TaggedWebcamFeed[]): TaggedWebcamFeed[] {
  return sortBy(feeds, (f) => { return f.body.id || Infinity; });
}

export function Edit(props: WebcamPanelProps) {
  const rows = sortedFeeds(props.feeds).map(wcf => {
    return <KeyValEditRow key={wcf.uuid}
      onClick={() => props.destroy(wcf)}
      onLabelChange={(e) => props.edit(wcf, { name: e.currentTarget.value })}
      onValueChange={(e) => props.edit(wcf, { url: e.currentTarget.value })}
      disabled={true}
      value={wcf.body.url}
      valuePlaceholder={"HTTP://..."}
      label={wcf.body.name}
      labelPlaceholder={t("Feed Name")}
      valueType="string" />;
  });
  const unsaved = props
    .feeds
    .filter(x => x.specialStatus === SpecialStatus.DIRTY);
  return <div className={"webcam-widget grid"}>
    <div className={"grid"}>
      {rows}
    </div>
    <div className={"webcam-buttons"}>
      <button
        className="fb-button gray"
        disabled={unsaved.length > 0}
        title={t("Back")}
        onClick={props.onToggle}>
        {t("Back")}
      </button>
      <button
        className="fb-button green"
        title={t("Save")}
        onClick={() => { unsaved.map(x => props.save(x)); }}>
        {t("Save")}{unsaved.length > 0 ? "*" : ""}
      </button>
      <button
        className="fb-button green"
        title={t("Add webcam")}
        onClick={props.init}>
        <i className="fa fa-plus" />
      </button>
    </div>
  </div>;
}
