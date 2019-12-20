import React from "react";
import {
  BlurableInput,
  EmptyStateWrapper,
  EmptyStateGraphic,
  Saucer,
  ColorPicker
} from "../ui";
import {
  FolderUnion,
  FolderItemProps,
  FolderNodeProps,
  FolderProps,
  FolderState,
  AddFolderBtn,
  AddSequenceProps,
  ToggleFolderBtnProps
} from "./constants";
import {
  createFolder,
  deleteFolder,
  setFolderName,
  toggleFolderOpenState,
  toggleFolderEditState,
  toggleAll,
  updateSearchTerm,
  addNewSequenceToFolder,
  moveSequence,
  setFolderColor
} from "./actions";
import { Link } from "../link";
import { urlFriendly, lastUrlChunk } from "../util";
import {
  setActiveSequenceByName
} from "../sequences/set_active_sequence_by_name";
import { Popover } from "@blueprintjs/core";
import { t } from "../i18next_wrapper";
import { Content } from "../constants";
import { StepDragger, NULL_DRAGGER_ID } from "../draggable/step_dragger";
import { variableList } from "../sequences/locals_list/variable_support";

const FolderListItem = (props: FolderItemProps) => {
  const { sequence, onClick } = props;
  const seqName = sequence.body.name;
  const url = `/app/sequences/${urlFriendly(seqName) || ""}`;
  const moveTarget = props.isMoveTarget ? "move-source" : "";
  const nameWithSaveIndicator = seqName + (sequence.specialStatus ? "*" : "");
  const active = lastUrlChunk() === urlFriendly(seqName) ? "active" : "";
  return <StepDragger
    dispatch={props.dispatch}
    step={{
      kind: "execute",
      args: { sequence_id: props.sequence.body.id || 0 },
      body: variableList(props.variableData)
    }}
    intent="step_splice"
    draggerId={NULL_DRAGGER_ID}>
    <Link to={url} key={sequence.uuid} onClick={setActiveSequenceByName}>
      <li className={`sequence-list-item ${active} ${moveTarget}`} draggable={true}>
        <Saucer color={sequence.body.color || "gray"} active={false} />
        <p>{nameWithSaveIndicator}</p>
        <div className="sequence-list-item-icons">
          {props.inUse &&
            <i className="in-use fa fa-hdd-o" title={t(Content.IN_USE)} />}
          <i className="fa fa-arrows-v" onClick={() => onClick(sequence.uuid)} />
        </div>
      </li>
    </Link>
  </StepDragger>;
};

const ToggleFolderBtn = (p: ToggleFolderBtnProps) => {
  const klass = `fa fa-${p.expanded ? "plus" : "minus"}-square`;
  return <button className="fb-button gray" onClick={p.onClick}>
    <i className={klass} />
  </button>;
};

const AddFolderBtn = ({ folder }: AddFolderBtn) => {
  return <button
    className="fb-button green"
    onClick={() => createFolder(folder || {})}>
    <div className="fa-stack fa-2x" title={"Create Subfolder"}>
      <i className="fa fa-folder fa-stack-2x" />
      <i className="fa fa-plus fa-stack-1x" />
    </div>
  </button>;
};

const AddSequenceBtn = ({ folderId }: AddSequenceProps) => {
  return <button
    className="fb-button green"
    onClick={() => addNewSequenceToFolder(folderId)}>
    <div className="fa-stack fa-2x">
      <i className="fa fa-server fa-stack-2x" />
      <i className="fa fa-plus fa-stack-1x" />
    </div>
  </button>;
};

const FolderButtonCluster = ({ node }: FolderNodeProps) => {
  return <div className="folder-button-cluster">
    <button
      className="fb-button red"
      onClick={() => deleteFolder(node.id)}>
      <i className="fa fa-trash" />
    </button>
    <button
      className="fb-button gray"
      onClick={() => toggleFolderEditState(node.id)}>
      <i className="fa fa-pencil" />
    </button>
    {node.kind !== "terminal" &&
      <AddFolderBtn folder={{ parent_id: node.id }} />}
    <AddSequenceBtn folderId={node.id} />
  </div>;
};

const FolderNameEditor = (props: FolderNodeProps) => {
  const { node } = props;
  const moveModeTarget = props.movedSequenceUuid ? "move-target" : "";
  const nodeName = moveModeTarget ? t("CLICK TO MOVE HERE") : node.name;
  const onClick = () => moveModeTarget ? props.onMoveEnd(node.id) : undefined;
  const toggle = () => moveModeTarget ? undefined : toggleFolderOpenState(node.id);
  return <div className={`folder-list-item ${moveModeTarget}`}
    onClick={onClick}>
    <i className={`fa fa-chevron-${node.open ? "down" : "right"}`}
      title={"Open/Close Folder"}
      onClick={toggle} />
    <ColorPicker
      saucerIcon={"fa-folder"}
      current={node.color}
      onChange={color => setFolderColor(node.id, color)} />
    <div className="folder-name" onClick={toggle}>
      {node.editing
        ? <BlurableInput value={nodeName} onCommit={e =>
          setFolderName(node.id, e.currentTarget.value)
            .then(() => toggleFolderEditState(node.id))} />
        : <p>{nodeName}</p>}
    </div>
    <Popover className="folder-settings-icon" usePortal={false}>
      <i className={"fa fa-ellipsis-v"} />
      <FolderButtonCluster {...props} />
    </Popover>
  </div>;
};

const FolderNode = (props: FolderNodeProps) => {
  const { node, sequences } = props;

  const names = node
    .content
    .map(seqUuid => <FolderListItem
      sequence={sequences[seqUuid]}
      key={"F" + seqUuid}
      dispatch={props.dispatch}
      variableData={props.sequenceMetas[seqUuid]}
      inUse={!!props.resourceUsage[seqUuid]}
      onClick={props.onMoveStart}
      isMoveTarget={props.movedSequenceUuid === seqUuid} />);

  const mapper = (n2: FolderUnion) => <FolderNode
    node={n2}
    key={n2.id}
    sequences={sequences}
    dispatch={props.dispatch}
    sequenceMetas={props.sequenceMetas}
    resourceUsage={props.resourceUsage}
    movedSequenceUuid={props.movedSequenceUuid}
    onMoveStart={props.onMoveStart}
    onMoveEnd={props.onMoveEnd} />;
  const array: FolderUnion[] = node.children || [];
  return <div className="folder">
    <FolderNameEditor {...props} />
    {!!node.open && <ul className="in-folder-sequences">{names}</ul>}
    {!!node.open && array.map(mapper)}
  </div>;
};

export class Folders extends React.Component<FolderProps, FolderState> {
  state: FolderState = { toggleDirection: false };

  Graph = (_props: {}) => {

    return <div className="folders">
      {this.props.rootFolder.folders.map(grandparent => {
        return <FolderNode
          node={grandparent}
          key={grandparent.id}
          dispatch={this.props.dispatch}
          sequenceMetas={this.props.sequenceMetas}
          resourceUsage={this.props.resourceUsage}
          movedSequenceUuid={this.state.movedSequenceUuid}
          onMoveStart={this.startSequenceMove}
          onMoveEnd={this.endSequenceMove}
          sequences={this.props.sequences} />;
      })}
    </div>;
  }

  toggleAll = () => {
    toggleAll(this.state.toggleDirection);
    this.setState({ toggleDirection: !this.state.toggleDirection });
  }

  startSequenceMove = (seqUuid: string) => {
    this.setState({ movedSequenceUuid: seqUuid });
  }

  endSequenceMove = (folderId: number) => {
    moveSequence(this.state.movedSequenceUuid || "", folderId);
    this.setState({ movedSequenceUuid: undefined });
  }

  rootSequences = () => this
    .props
    .rootFolder
    .noFolder
    .map(seqUuid => <FolderListItem
      key={seqUuid}
      dispatch={this.props.dispatch}
      variableData={this.props.sequenceMetas[seqUuid]}
      inUse={!!this.props.resourceUsage[seqUuid]}
      sequence={this.props.sequences[seqUuid]}
      onClick={this.startSequenceMove}
      isMoveTarget={this.state.movedSequenceUuid === seqUuid} />);

  render() {
    return <div className="folders-panel">
      <div className="panel-top with-button">
        <div className="thin-search-wrapper">
          <div className="text-input-wrapper">
            <i className="fa fa-search" />
            <input
              value={this.props.searchTerm || ""}
              onChange={({ currentTarget }) => {
                updateSearchTerm(currentTarget.value);
              }}
              type="text"
              placeholder={t("Search sequences")} />
          </div>
        </div>
        <ToggleFolderBtn
          expanded={this.state.toggleDirection}
          onClick={this.toggleAll} />
        <AddFolderBtn />
        <AddSequenceBtn />
      </div>
      <EmptyStateWrapper
        notEmpty={Object.values(this.props.sequences).length > 0
          || this.props.rootFolder.folders.length > 0}
        graphic={EmptyStateGraphic.sequences}
        title={t("No Sequences.")}
        text={Content.NO_SEQUENCES}>
        <ul className="sequences-not-in-folders">
          {this.rootSequences()}
        </ul>
        <this.Graph />
      </EmptyStateWrapper>
    </div>;
  }
}
