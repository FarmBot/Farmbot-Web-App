import * as React from "react";
import { t } from "i18next";
import { push } from "../history";
import { selectSequence } from "./actions";
import { SequencesListProps, SequencesListState } from "./interfaces";
import { sortResourcesById, urlFriendly, lastUrlChunk } from "../util";
import { Row, Col } from "../ui/index";
import { TaggedSequence } from "farmbot";
import { init } from "../api/crud";
import { Content } from "../constants";
import { StepDragger, NULL_DRAGGER_ID } from "../draggable/step_dragger";
import { Link } from "../link";

const filterFn = (searchTerm: string) => (seq: TaggedSequence): boolean => seq
  .body
  .name
  .toLowerCase()
  .includes(searchTerm);
const sequenceList = (dispatch: Function, usage: Record<string, boolean | undefined>) =>
  (ts: TaggedSequence) => {
    const css =
      [`fb-button`, `block`, `full-width`, `${ts.body.color || "purple"}`];
    lastUrlChunk() === urlFriendly(ts.body.name) && css.push("active");
    const click = () => dispatch(selectSequence(ts.uuid));
    const name = ts.body.name + (ts.specialStatus ? "*" : "");
    const { uuid } = ts;
    const inUse = !!usage[ts.uuid];

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
            {inUse && <i className="in-use fa fa-hdd-o" title={t(Content.IN_USE)} />}
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

  emptySequenceBody = (): TaggedSequence["body"] => ({
    name: t("new sequence {{ num }}", { num: this.props.sequences.length }),
    args: {
      version: -999,
      locals: { kind: "scope_declaration", args: {} },
    },
    color: "gray",
    kind: "sequence",
    body: []
  });

  render() {
    const { sequences, dispatch } = this.props;
    const searchTerm = this.state.searchTerm.toLowerCase();
    const { resourceUsage } = this.props;
    return <div>
      <button
        className="fb-button green add"
        onClick={() => {
          const newSequence = this.emptySequenceBody();
          dispatch(init("Sequence", newSequence));
          push("/app/sequences/" + urlFriendly(newSequence.name));
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
                .filter(filterFn(searchTerm))
                .map(sequenceList(dispatch, resourceUsage))
            }
          </div>
        </Col>
      </Row>
    </div>;
  }
}
