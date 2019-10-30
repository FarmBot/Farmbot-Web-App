import * as React from "react";
import { push } from "../history";
import { SequencesListProps, SequencesListState } from "./interfaces";
import { sortResourcesById, urlFriendly, lastUrlChunk } from "../util";
import { Row, Col } from "../ui/index";
import { TaggedSequence } from "farmbot";
import { init, destroy } from "../api/crud";
import { Content } from "../constants";
import { StepDragger, NULL_DRAGGER_ID } from "../draggable/step_dragger";
import { Link } from "../link";
import { setActiveSequenceByName } from "./set_active_sequence_by_name";
import { UUID, VariableNameSet } from "../resources/interfaces";
import { variableList } from "./locals_list/variable_support";
import { t } from "../i18next_wrapper";
import { EmptyStateWrapper, EmptyStateGraphic } from "../ui/empty_state_wrapper";
import { DevSettings } from "../account/dev/dev_support";

const filterFn = (searchTerm: string) => (seq: TaggedSequence): boolean =>
  seq.body.name.toLowerCase().includes(searchTerm);

interface SequenceButtonWrapperProps {
  ts: TaggedSequence;
  dispatch: Function;
  variableData: VariableNameSet | undefined;
  children: React.ReactChild;
}

/** Sequence list item wrapper for drag action and link to sequence. */
const SequenceButtonWrapper = (props: SequenceButtonWrapperProps) =>
  <div className="sequence-list-item" key={props.ts.uuid}>
    <StepDragger
      dispatch={props.dispatch}
      step={{
        kind: "execute",
        args: { sequence_id: props.ts.body.id || 0 },
        body: variableList(props.variableData)
      }}
      intent="step_splice"
      draggerId={NULL_DRAGGER_ID}>
      <Link
        to={`/app/sequences/${urlFriendly(props.ts.body.name) || ""}`}
        key={props.ts.uuid}
        onClick={setActiveSequenceByName}>
        {props.children}
      </Link>
    </StepDragger>
  </div>;

interface SequenceButtonProps {
  ts: TaggedSequence;
  inUse: boolean;
  deleteFunc?: () => void;
}

/** Sequence list item label and indicators. */
const SequenceButton = (props: SequenceButtonProps) => {
  const { color, name } = props.ts.body;
  const css = [`fb-button`, `block`, `full-width`, `${color || "purple"}`];
  lastUrlChunk() === urlFriendly(name) && css.push("active");
  props.deleteFunc && css.push("quick-del");
  const nameWithSaveIndicator = name + (props.ts.specialStatus ? "*" : "");
  return <button className={css.join(" ")} draggable={true}
    onClick={props.deleteFunc}>
    <label>{nameWithSaveIndicator}</label>
    {props.inUse &&
      <i className="in-use fa fa-hdd-o" title={t(Content.IN_USE)} />}
  </button>;
};

interface SequenceListItemProps {
  dispatch: Function;
  resourceUsage: Record<UUID, boolean | undefined>;
  sequenceMetas: Record<UUID, VariableNameSet | undefined>;
}

const SequenceListItem = (props: SequenceListItemProps) =>
  (ts: TaggedSequence) => {
    const inUse = !!props.resourceUsage[ts.uuid];
    const variableData = props.sequenceMetas[ts.uuid];
    const deleteSeq = () => props.dispatch(destroy(ts.uuid));

    return <div className="sequence-list-item" key={ts.uuid}>
      {DevSettings.quickDeleteEnabled()
        ? <SequenceButton ts={ts} inUse={inUse} deleteFunc={deleteSeq} />
        : <SequenceButtonWrapper
          ts={ts} dispatch={props.dispatch} variableData={variableData}>
          <SequenceButton ts={ts} inUse={inUse} />
        </SequenceButtonWrapper>}
    </div>;
  };

const emptySequenceBody = (seqCount: number): TaggedSequence["body"] => ({
  name: t("new sequence {{ num }}", { num: seqCount }),
  args: {
    version: -999,
    locals: { kind: "scope_declaration", args: {} },
  },
  color: "gray",
  kind: "sequence",
  body: []
});

interface SequenceListHeaderProps {
  onChange(e: React.SyntheticEvent<HTMLInputElement>): void;
  sequenceCount: number;
  dispatch: Function;
}

const SequenceListHeader = (props: SequenceListHeaderProps) =>
  <div className={"panel-top with-button"}>
    <div className="thin-search-wrapper">
      <div className="text-input-wrapper">
        <i className="fa fa-search"></i>
        <input
          onChange={props.onChange}
          placeholder={t("Search Sequences...")} />
      </div>
    </div>
    <button
      className="fb-button green add"
      onClick={() => {
        const newSequence = emptySequenceBody(props.sequenceCount);
        props.dispatch(init("Sequence", newSequence));
        push("/app/sequences/" + urlFriendly(newSequence.name));
        setActiveSequenceByName();
      }}>
      <i className="fa fa-plus" />
    </button>
  </div>;

export class SequencesList extends
  React.Component<SequencesListProps, SequencesListState> {

  state: SequencesListState = {
    searchTerm: ""
  };

  onChange = (e: React.SyntheticEvent<HTMLInputElement>) =>
    this.setState({ searchTerm: e.currentTarget.value });

  render() {
    const { sequences, dispatch, resourceUsage, sequenceMetas } = this.props;
    const searchTerm = this.state.searchTerm.toLowerCase();
    return <div>
      <SequenceListHeader
        dispatch={dispatch}
        sequenceCount={this.props.sequences.length}
        onChange={this.onChange} />
      <Row>
        <Col xs={12}>
          <EmptyStateWrapper
            notEmpty={sequences.length > 0}
            graphic={EmptyStateGraphic.sequences}
            title={t("No Sequences.")}
            text={Content.NO_SEQUENCES}>
            {sequences.length > 0 &&
              <div className="sequence-list">
                {sortResourcesById(sequences)
                  .filter(filterFn(searchTerm))
                  .map(SequenceListItem({
                    dispatch, resourceUsage, sequenceMetas
                  }))}
              </div>}
          </EmptyStateWrapper>
        </Col>
      </Row>
    </div>;
  }
}
