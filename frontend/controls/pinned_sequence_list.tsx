import React from "react";
import { t } from "../i18next_wrapper";
import { ToolTips } from "../constants";
import { TestButton } from "../sequences/test_button";
import { Widget, WidgetHeader, WidgetBody, Row, Col } from "../ui";
import { PinnedSequencesProps } from "./interfaces";

export const PinnedSequences = (props: PinnedSequencesProps) => {
  const pinnedSequences = props.sequences.filter(x => x.body.pinned);
  return <div className={"pinned-sequence-list"}>
    {pinnedSequences.length > 0 &&
      <Widget className={"pinned-sequences-widget"}>
        <WidgetHeader
          title={t("Pinned Sequences")}
          helpText={ToolTips.PINNED_SEQUENCES} />
        <WidgetBody>
          {pinnedSequences.map(sequence =>
            <Row key={sequence.uuid}>
              <Col xs={8}>
                <label style={{ marginTop: 0, verticalAlign: "top" }}>
                  {sequence.body.name}
                </label>
              </Col>
              <Col xs={4}>
                <TestButton component={"pinned"}
                  syncStatus={props.syncStatus}
                  sequence={sequence}
                  resources={props.resources}
                  menuOpen={props.menuOpen}
                  dispatch={props.dispatch} />
              </Col>
            </Row>)}
        </WidgetBody>
      </Widget>}
  </div>;
};
