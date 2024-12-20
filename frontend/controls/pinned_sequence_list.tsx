import React from "react";
import { t } from "../i18next_wrapper";
import { ToolTips } from "../constants";
import { TestButton } from "../sequences/test_button";
import { Widget, WidgetHeader, WidgetBody, Row } from "../ui";
import { PinnedSequencesProps } from "./interfaces";

export const PinnedSequences = (props: PinnedSequencesProps) => {
  const pinnedSequences = props.sequences.filter(x => x.body.pinned);
  return <div className={"pinned-sequence-list"}>
    {pinnedSequences.length > 0 &&
      <Widget>
        <WidgetHeader
          title={t("Pinned Sequences")}
          helpText={ToolTips.PINNED_SEQUENCES} />
        <WidgetBody>
          <div className="grid">
            {pinnedSequences.map(sequence =>
              <Row key={sequence.uuid} className="grid-exp-1">
                <label style={{ marginTop: 0, verticalAlign: "top" }}>
                  {sequence.body.name}
                </label>
                <TestButton component={"pinned"}
                  syncStatus={props.syncStatus}
                  sequence={sequence}
                  resources={props.resources}
                  menuOpen={props.menuOpen}
                  dispatch={props.dispatch} />
              </Row>)}
          </div>
        </WidgetBody>
      </Widget>}
  </div>;
};
