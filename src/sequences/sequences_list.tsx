import * as React from "react";
import { Link } from "react-router";
import * as _ from "lodash";
import { t } from "i18next";
import { history, push } from "../history";
import { selectSequence } from "./actions";
import { SequencesListProps, SequencesListState } from "./interfaces";
import {
  isMobile,
  sortResourcesById,
  urlFriendly,
  lastUrlChunk
} from "../util";
import { Row, Col, ToolTip } from "../ui/index";
import { TaggedSequence } from "../resources/tagged_resources";
import { init } from "../api/crud";
import { ToolTips } from "../constants";

let sequenceList = (dispatch: Function) =>
  (ts: TaggedSequence, index: number) => {
    let css = [
      "fb-button",
      "block-wrapper",
      "block",
      "full-width",
      "text-left",
      `${ts.body.color || "purple"}`,
      "block-header"
    ];
    lastUrlChunk() === urlFriendly(ts.body.name) && css.push("active");
    let click = () => dispatch(selectSequence(ts.uuid));
    let name = ts.body.name + (ts.dirty ? "*" : "");
    let { uuid } = ts;
    return <Link
      to={`/app/sequences/${urlFriendly(ts.body.name) || ""}`}
      key={uuid}
      onClick={click}
    >
      <button className={css.join(" ")}>
        {name}
      </button>
    </Link>;
  };

export class SequencesList extends
  React.Component<SequencesListProps, SequencesListState> {

  state: SequencesListState = {
    searchTerm: ""
  };

  onChange = (e: React.SyntheticEvent<HTMLInputElement>) =>
    this.setState({ searchTerm: e.currentTarget.value });

  emptySequence = (): TaggedSequence => {
    return {
      kind: "sequences",
      uuid: "REDUCER_MUST_CHANGE_THIS",
      body: {
        name: "new sequence " + (this.props.sequences.length + 1),
        args: { version: -999 },
        color: "gray",
        kind: "sequence",
        body: []
      }
    };
  }

  render() {
    let { sequences, dispatch } = this.props;
    let searchTerm = this.state.searchTerm.toLowerCase();

    return <div className="sequence-list">
      <h3>
        <i>{t("Sequences")}</i>
      </h3>
      <ToolTip helpText={ToolTips.SEQUENCE_LIST} />
      <button
        className="fb-button green"
        onClick={() => dispatch(init(this.emptySequence()))}
      >
        <i className="fa fa-plus" />
      </button>
      <input
        onChange={this.onChange}
        placeholder={t("Search Sequences...")}
      />
      <Row>
        <Col xs={12}>
          {
            sortResourcesById(sequences)
              .filter(seq => seq
                .body
                .name
                .toLowerCase()
                .includes(searchTerm))
              .map(sequenceList(dispatch))
          }
        </Col>
      </Row>
    </div>;
  }
}
