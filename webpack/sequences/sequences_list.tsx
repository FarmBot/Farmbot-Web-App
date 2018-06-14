import * as React from "react";
import { Link } from "react-router";
import { t } from "i18next";
import { push } from "../history";
import { selectSequence } from "./actions";
import { SequencesListProps, SequencesListState } from "./interfaces";
import { sortResourcesById, urlFriendly, lastUrlChunk } from "../util";
import { Row, Col } from "../ui/index";
import { TaggedSequence, SpecialStatus } from "../resources/tagged_resources";
import { init } from "../api/crud";
import { Content } from "../constants";
import { StepDragger, NULL_DRAGGER_ID } from "../draggable/step_dragger";

const sequenceList = (dispatch: Function) =>
  (ts: TaggedSequence) => {
    const css = [
      `fb-button`,
      `block`,
      `full-width`,
      `${ts.body.color || "purple"}`
    ];
    lastUrlChunk() === urlFriendly(ts.body.name) && css.push("active");
    const click = () => dispatch(selectSequence(ts.uuid));
    const name = ts.body.name + (ts.specialStatus ? "*" : "");
    const { uuid } = ts;
    return <div className="sequence-list-items" key={uuid}>
      <StepDragger
        dispatch={dispatch}
        step={{
          kind: "execute",
          args: { sequence_id: ts.body.id || 0 }
        }}
        intent="step_splice"
        draggerId={NULL_DRAGGER_ID}>
        <Link
          to={`/app/sequences/${urlFriendly(ts.body.name) || ""}`}
          key={uuid}
          onClick={click} >
          <button className={css.join(" ")} draggable={true}>
            <label>{name}</label>
            {ts.body.in_use &&
              <i className="in-use fa fa-hdd-o" title={t(Content.IN_USE)} />}
          </button>
        </Link>
      </StepDragger>
    </div>;
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
      kind: "Sequence",
      uuid: "REDUCER_MUST_CHANGE_THIS",
      specialStatus: SpecialStatus.SAVED,
      body: {
        name: t("new sequence {{ num }}", { num: this.props.sequences.length }),
        args: {
          version: -999,
          locals: { kind: "scope_declaration", args: {} },
        },
        color: "gray",
        kind: "sequence",
        body: []
      }
    };
  }

  render() {
    const { sequences, dispatch } = this.props;
    const searchTerm = this.state.searchTerm.toLowerCase();

    return <div>
      <button
        className="fb-button green add"
        onClick={() => {
          dispatch(init(this.emptySequence()));
          push("/app/sequences/new_sequence_" + (sequences.length++));
        }}>
        <i className="fa fa-plus" />
      </button>
      <input
        onChange={this.onChange}
        placeholder={t("Search Sequences...")} />
      <Row>
        <Col xs={12}>
          <div className="sequence-list">
            {
              sortResourcesById(sequences)
                .filter(seq => seq
                  .body
                  .name
                  .toLowerCase()
                  .includes(searchTerm))
                .map(sequenceList(dispatch))
            }
          </div>
        </Col>
      </Row>
    </div>;
  }
}
