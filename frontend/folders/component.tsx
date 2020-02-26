import React from "react";
import {
  BlurableInput,
  EmptyStateWrapper,
  EmptyStateGraphic,
  ColorPicker,
} from "../ui";
import {
  FolderUnion,
  FolderItemProps,
  FolderNodeProps,
  FolderProps,
  FolderState,
  AddFolderBtn,
  AddSequenceProps,
  ToggleFolderBtnProps,
  FolderNodeState,
  FolderPanelTopProps,
  SequenceDropAreaProps,
  FolderButtonClusterProps,
  FolderNameInputProps,
  SequenceDropAreaState,
} from "./interfaces";
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
  setFolderColor,
  dropSequence,
  sequenceEditMaybeSave,
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
import { UUID } from "../resources/interfaces";

export const FolderListItem = (props: FolderItemProps) => {
  const { sequence, movedSequenceUuid } = props;
  const seqName = sequence.body.name;
  const url = `/app/sequences/${urlFriendly(seqName) || ""}`;
  const moveSource = movedSequenceUuid === sequence.uuid ? "move-source" : "";
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
    draggerId={NULL_DRAGGER_ID}
    resourceUuid={sequence.uuid}>
    <li className={`sequence-list-item ${active} ${moveSource}`}
      draggable={true}>
      <ColorPicker
        current={sequence.body.color || "gray"}
        onChange={color => sequenceEditMaybeSave(sequence, { color })} />
      <Link to={url} key={sequence.uuid} onClick={setActiveSequenceByName}>
        <p>{nameWithSaveIndicator}</p>
      </Link>
      <div className="sequence-list-item-icons">
        {props.inUse &&
          <i className="in-use fa fa-hdd-o" title={t(Content.IN_USE)} />}
        <i className="fa fa-arrows-v"
          onMouseDown={() => props.startSequenceMove(sequence.uuid)}
          onMouseUp={() => props.toggleSequenceMove(sequence.uuid)} />
      </div>
    </li>
  </StepDragger>;
};

const ToggleFolderBtn = (props: ToggleFolderBtnProps) => {
  return <button className="fb-button gray" onClick={props.onClick}>
    <i className={`fa fa-chevron-${props.expanded ? "right" : "down"}`} />
  </button>;
};

const AddFolderBtn = ({ folder, close }: AddFolderBtn) => {
  return <button
    className="fb-button green"
    onClick={() => { close?.(); createFolder(folder); }}>
    <div className="fa-stack fa-2x" title={"Create Subfolder"}>
      <i className="fa fa-folder fa-stack-2x" />
      <i className="fa fa-plus fa-stack-1x" />
    </div>
  </button>;
};

const AddSequenceBtn = ({ folderId, close }: AddSequenceProps) => {
  return <button
    className="fb-button green"
    onClick={() => { close?.(); addNewSequenceToFolder(folderId); }}>
    <div className="fa-stack fa-2x">
      <i className="fa fa-server fa-stack-2x" />
      <i className="fa fa-plus fa-stack-1x" />
    </div>
  </button>;
};

export const FolderButtonCluster =
  ({ node, close }: FolderButtonClusterProps) => {
    return <div className="folder-button-cluster">
      <button
        className="fb-button red"
        onClick={() => deleteFolder(node.id)}>
        <i className="fa fa-trash" />
      </button>
      <button
        className="fb-button gray"
        onClick={() => { close(); toggleFolderEditState(node.id); }}>
        <i className="fa fa-pencil" />
      </button>
      {node.kind !== "terminal" &&
        <AddFolderBtn folder={{ parent_id: node.id }} close={close} />}
      <AddSequenceBtn folderId={node.id} close={close} />
    </div>;
  };

export const FolderNameInput = ({ node }: FolderNameInputProps) =>
  <div className="folder-name-input">
    <BlurableInput value={node.name} autoFocus={true} autoSelect={true}
      onCommit={e => {
        setFolderName(node.id, e.currentTarget.value);
        toggleFolderEditState(node.id);
      }} />
    <button
      className="fb-button green"
      onClick={() => toggleFolderEditState(node.id)}>
      <i className="fa fa-check" />
    </button>
  </div>;

export class FolderNameEditor
  extends React.Component<FolderNodeProps, FolderNodeState> {
  state: FolderNodeState = { settingsOpen: false };
  close = () => this.setState({ settingsOpen: false });
  render() {
    const { node } = this.props;
    const settingsOpenClass = this.state.settingsOpen ? "open" : "";
    return <div className={"folder-list-item"}>
      <i className={`fa fa-chevron-${node.open ? "down" : "right"}`}
        title={"Open/Close Folder"}
        onClick={() => toggleFolderOpenState(node.id)} />
      <ColorPicker
        saucerIcon={"fa-folder"}
        current={node.color}
        onChange={color => setFolderColor(node.id, color)} />
      <div className="folder-name">
        {node.editing
          ? <FolderNameInput node={node} />
          : <p>{node.name}</p>}
      </div>
      <Popover className="folder-settings-icon" usePortal={false}
        isOpen={this.state.settingsOpen}>
        <i className={`fa fa-ellipsis-v ${settingsOpenClass}`}
          onClick={() =>
            this.setState({ settingsOpen: !this.state.settingsOpen })} />
        <FolderButtonCluster {...this.props} close={this.close} />
      </Popover>
    </div>;
  }
}

const FolderNode = (props: FolderNodeProps) => {
  const { node, sequences } = props;

  const sequenceItems = node.content.map(seqUuid =>
    <FolderListItem
      sequence={sequences[seqUuid]}
      key={"F" + seqUuid}
      dispatch={props.dispatch}
      variableData={props.sequenceMetas[seqUuid]}
      inUse={!!props.resourceUsage[seqUuid]}
      toggleSequenceMove={props.toggleSequenceMove}
      startSequenceMove={props.startSequenceMove}
      movedSequenceUuid={props.movedSequenceUuid} />);

  const childFolders: FolderUnion[] = node.children || [];
  const folderNodes = childFolders.map(folder =>
    <FolderNode
      node={folder}
      key={folder.id}
      sequences={sequences}
      dispatch={props.dispatch}
      sequenceMetas={props.sequenceMetas}
      resourceUsage={props.resourceUsage}
      movedSequenceUuid={props.movedSequenceUuid}
      toggleSequenceMove={props.toggleSequenceMove}
      startSequenceMove={props.startSequenceMove}
      onMoveEnd={props.onMoveEnd} />);

  return <div className="folder">
    <FolderNameEditor {...props} />
    {!!node.open && <ul className="in-folder-sequences">{sequenceItems}</ul>}
    <SequenceDropArea
      dropAreaVisible={!!props.movedSequenceUuid}
      onMoveEnd={props.onMoveEnd}
      toggleSequenceMove={props.toggleSequenceMove}
      folderId={node.id}
      folderName={node.name} />
    {!!node.open && folderNodes}
  </div>;
};

export class SequenceDropArea
  extends React.Component<SequenceDropAreaProps, SequenceDropAreaState> {
  state: SequenceDropAreaState = { hovered: false };
  render() {
    const { dropAreaVisible, folderId, onMoveEnd, folderName } = this.props;
    const visible = dropAreaVisible ? "visible" : "";
    const hovered = this.state.hovered ? "hovered" : "";
    return <div
      className={`folder-drop-area ${visible} ${hovered}`}
      onClick={() => onMoveEnd(folderId)}
      onDrop={e => {
        this.setState({ hovered: false });
        dropSequence(folderId)(e);
        this.props.toggleSequenceMove();
      }}
      onDragOver={e => e.preventDefault()}
      onDragEnter={() => this.setState({ hovered: true })}
      onDragLeave={() => this.setState({ hovered: false })}>
      {folderId
        ? `${t("Move into")} ${folderName}`
        : t("Move out of folders")}
    </div>;
  }
}

export class Folders extends React.Component<FolderProps, FolderState> {
  state: FolderState = { toggleDirection: false };

  Graph = () => {
    return <div className="folders">
      {this.props.rootFolder.folders.map(grandparent => {
        return <FolderNode
          node={grandparent}
          key={grandparent.id}
          dispatch={this.props.dispatch}
          sequenceMetas={this.props.sequenceMetas}
          resourceUsage={this.props.resourceUsage}
          movedSequenceUuid={this.state.movedSequenceUuid}
          toggleSequenceMove={this.toggleSequenceMove}
          startSequenceMove={this.startSequenceMove}
          onMoveEnd={this.endSequenceMove}
          sequences={this.props.sequences} />;
      })}
    </div>;
  }

  toggleAll = () => {
    toggleAll(this.state.toggleDirection);
    this.setState({ toggleDirection: !this.state.toggleDirection });
  }

  startSequenceMove = (seqUuid: UUID) => this.setState({
    movedSequenceUuid: seqUuid,
    stashedUuid: this.state.movedSequenceUuid,
  })

  toggleSequenceMove = (seqUuid?: UUID) => this.setState({
    movedSequenceUuid: this.state.stashedUuid ? undefined : seqUuid,
  })

  endSequenceMove = (folderId: number) => {
    moveSequence(this.state.movedSequenceUuid || "", folderId);
    this.setState({ movedSequenceUuid: undefined });
  }

  rootSequences = () => this.props.rootFolder.noFolder.map(seqUuid =>
    <FolderListItem
      key={seqUuid}
      dispatch={this.props.dispatch}
      variableData={this.props.sequenceMetas[seqUuid]}
      inUse={!!this.props.resourceUsage[seqUuid]}
      sequence={this.props.sequences[seqUuid]}
      toggleSequenceMove={this.toggleSequenceMove}
      startSequenceMove={this.startSequenceMove}
      movedSequenceUuid={this.state.movedSequenceUuid} />);

  render() {
    return <div className="folders-panel">
      <FolderPanelTop
        searchTerm={this.props.searchTerm}
        toggleDirection={this.state.toggleDirection}
        toggleAll={this.toggleAll} />
      <EmptyStateWrapper
        notEmpty={Object.values(this.props.sequences).length > 0
          || this.props.rootFolder.folders.length > 0}
        graphic={EmptyStateGraphic.sequences}
        title={t("No Sequences.")}
        text={Content.NO_SEQUENCES}>
        <ul className="sequences-not-in-folders">
          {this.rootSequences()}
        </ul>
        <SequenceDropArea
          dropAreaVisible={!!this.state.movedSequenceUuid}
          onMoveEnd={this.endSequenceMove}
          toggleSequenceMove={this.toggleSequenceMove}
          folderId={0}
          folderName={"none"} />
        <this.Graph />
      </EmptyStateWrapper>
    </div>;
  }
}

export const FolderPanelTop = (props: FolderPanelTopProps) =>
  <div className="panel-top with-button">
    <div className="thin-search-wrapper">
      <div className="text-input-wrapper">
        <i className="fa fa-search" />
        <input
          value={props.searchTerm || ""}
          onChange={e => updateSearchTerm(e.currentTarget.value)}
          type="text"
          placeholder={t("Search sequences...")} />
      </div>
    </div>
    <ToggleFolderBtn
      expanded={props.toggleDirection}
      onClick={props.toggleAll} />
    <AddFolderBtn />
    <AddSequenceBtn />
  </div>;
