import React from "react";
import {
  BlurableInput,
  EmptyStateWrapper,
  EmptyStateGraphic,
  ColorPicker,
  Popover,
  Markdown,
} from "../ui";
import {
  FolderUnion,
  FolderItemProps,
  FolderNodeProps,
  FolderProps,
  FolderState,
  ToggleFolderBtnProps,
  FolderPanelTopProps,
  SequenceDropAreaProps,
  FolderButtonClusterProps,
  FolderNameInputProps,
  SequenceDropAreaState,
  SequenceButtonClusterProps,
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
import { urlFriendly } from "../util";
import {
  setActiveSequenceByName,
} from "../sequences/set_active_sequence_by_name";
import { t } from "../i18next_wrapper";
import { Content } from "../constants";
import { StepDragger, NULL_DRAGGER_ID } from "../draggable/step_dragger";
import { variableList } from "../sequences/locals_list/variable_support";
import { UUID } from "../resources/interfaces";
import { SearchField } from "../ui/search_field";
import {
  deleteSequence, isSequencePublished,
} from "../sequences/sequence_editor_middle_active";
import { Path } from "../internal_urls";
import { copySequence } from "../sequences/actions";
import { TestButton, isMenuOpen } from "../sequences/test_button";
import { TaggedSequence } from "farmbot";
import { useNavigate } from "react-router";

export const FolderListItem = (props: FolderItemProps) => {
  const { sequence, movedSequenceUuid, inUse } = props;
  const seqName = sequence.body.name;
  const url = Path.sequences(urlFriendly(seqName || ""));
  const moveSource = movedSequenceUuid === sequence.uuid ? "move-source" : "";
  const nameWithSaveIndicator = seqName + (sequence.specialStatus ? "*" : "");
  const active = Path.lastChunkEquals(urlFriendly(seqName)) ? "active" : "";
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [descriptionOpen, setDescriptionOpen] = React.useState(false);
  const menuOpen = isMenuOpen(props.menuOpen,
    { component: "list", uuid: sequence.uuid });
  const hovered = menuOpen || settingsOpen || descriptionOpen
    ? "hovered"
    : "";
  const matched = (props.searchTerm &&
    seqName.toLowerCase().includes(props.searchTerm.toLowerCase()))
    ? "matched"
    : "";
  return <StepDragger
    dispatch={props.dispatch}
    step={{
      kind: "execute",
      args: { sequence_id: props.sequence.body.id || 0 },
      body: variableList(props.variableData)
    }}
    intent="step_splice"
    draggerId={NULL_DRAGGER_ID}
    onDragStart={() => props.startSequenceMove(sequence.uuid)}
    onDragEnd={() => props.toggleSequenceMove()}
    resourceUuid={sequence.uuid}>
    <li
      className={["sequence-list-item", active, moveSource, hovered, matched]
        .join(" ")}
      draggable={true}>
      <ColorPicker
        current={sequence.body.color}
        onChange={color => sequenceEditMaybeSave(sequence, { color })} />
      <Link to={url} key={sequence.uuid} onClick={setActiveSequenceByName}
        draggable={false}>
        <p>{nameWithSaveIndicator}</p>
      </Link>
      <TestButton component={"list"}
        syncStatus={props.syncStatus}
        sequence={sequence}
        resources={props.resources}
        menuOpen={props.menuOpen}
        dispatch={props.dispatch} />
      <Popover
        popoverClassName={"sequence-item-description"}
        isOpen={descriptionOpen}
        target={<i className={"fa fa-question-circle help-icon"}
          onClick={() => setDescriptionOpen(!descriptionOpen)} />}
        content={<SequenceItemDescription inUse={inUse} sequence={sequence} />} />
      <Popover usePortal={false}
        popoverClassName={"sequence-item-action-menu"}
        isOpen={settingsOpen}
        target={<i className={`fa fa-ellipsis-v ${settingsOpen ? "open" : ""}`}
          onClick={() => setSettingsOpen(!settingsOpen)} />}
        content={<SequenceButtonCluster {...props} />} />
    </li>
  </StepDragger>;
};

interface SequenceItemDescriptionProps {
  inUse: boolean;
  sequence: TaggedSequence;
}

// eslint-disable-next-line complexity
const SequenceItemDescription = (props: SequenceItemDescriptionProps) => {
  const { sequence, inUse } = props;
  const deprecatedSteps = JSON.stringify(props.sequence.body.body)
    .includes("resource_update");
  const { pinned, forked, sequence_version_id, description } = props.sequence.body;
  const imported = sequence_version_id && !forked;
  const published = isSequencePublished(sequence);
  const hasInfo = deprecatedSteps || inUse || pinned || forked || imported
    || published;
  return <div className={"sequence-item-help help-text-content"}>
    <div className={"info-grid-wrapper"}>
      {deprecatedSteps &&
        <InfoRow className={"fa fa-exclamation-triangle"}
          description={t(Content.INCLUDES_DEPRECATED_STEPS)} />}
      {inUse &&
        <InfoRow className={"in-use fa fa-hdd-o"}
          description={t(Content.IN_USE)} />}
      {pinned &&
        <InfoRow className={"fa fa-thumb-tack"}
          description={t(Content.IS_PINNED)} />}
      {forked &&
        <InfoRow className={"fa fa-chain-broken"}
          description={t("Imported and edited publicly shared sequence.")} />}
      {imported &&
        <InfoRow className={"fa fa-link"}
          description={t("Imported publicly shared sequence.")} />}
      {published &&
        <InfoRow className={"fa fa-globe"}
          description={t("Published as a publicly shared sequence.")} />}
    </div>
    {hasInfo && <hr />}
    <label>{t("Description")}</label>
    <Markdown>{description || t("This sequence has no description.")}</Markdown>
  </div>;
};

interface InfoRowProps {
  className: string;
  description: string;
}

/** Fragments used for CSS grid to work properly. */
const InfoRow = (props: InfoRowProps) =>
  <React.Fragment>
    <i className={props.className} />
    <p>{props.description}</p>
  </React.Fragment>;

export const SequenceButtonCluster =
  (props: SequenceButtonClusterProps) => {
    const { dispatch, getWebAppConfigValue, sequence } = props;
    const navigate = useNavigate();
    return <div className="folder-button-cluster">
      <i
        className={"fa fa-trash fb-icon-button invert"}
        title={t("delete sequence")}
        onClick={deleteSequence({
          navigate,
          sequenceUuid: sequence.uuid,
          getWebAppConfigValue,
          dispatch,
        })} />
      <i
        className={"fa fa-copy fb-icon-button invert"}
        title={t("copy sequence")}
        onClick={() => dispatch(copySequence(navigate, sequence))} />
      <i className={"fa fa-arrows-v fb-icon-button invert"}
        title={t("move sequence")}
        onMouseDown={() => props.startSequenceMove(sequence.uuid)}
        onMouseUp={() => props.toggleSequenceMove(sequence.uuid)} />
    </div>;
  };

const ToggleFolderBtn = (props: ToggleFolderBtnProps) => {
  return <button className="fb-button gray"
    title={t("toggle folder open")}
    onClick={props.onClick}>
    <i className={`fa fa-chevron-${props.expanded ? "right" : "down"}`} />
  </button>;
};

interface PlusStackProps extends React.HTMLProps<HTMLDivElement> {
  icon: string;
}

const PlusStack = (props: PlusStackProps) =>
  <div className={"fa-stack fa-2x"} {...props}>
    <i className={`fa ${props.icon} fa-stack-2x`} />
    <i className={"fa fa-plus fa-stack-1x"} />
  </div>;

export const FolderButtonCluster =
  ({ node, close }: FolderButtonClusterProps) => {
    const navigate = useNavigate();
    return <div className={"folder-button-cluster"}>
      <i className={"fa fa-trash fb-icon-button invert"}
        title={t("delete folder")}
        onClick={() => { deleteFolder(node.id); }} />
      <i className={"fa fa-pencil fb-icon-button invert"}
        title={t("edit folder")}
        onClick={() => { close(); toggleFolderEditState(node.id); }} />
      {node.kind !== "terminal" &&
        <div className={"stack-wrapper fb-icon-button invert"}
          title={t("Create subfolder")}
          onClick={() => {
            close();
            createFolder({ parent_id: node.id, color: node.color });
          }}>
          <PlusStack icon={"fa-folder"} />
        </div>}
      <div className={"stack-wrapper fb-icon-button invert"}
        title={t("add new sequence")}
        onClick={() => {
          close();
          addNewSequenceToFolder(navigate, { id: node.id, color: node.color });
        }}>
        <PlusStack icon={"fa-server"} />
      </div>
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
      title={t("save folder name")}
      onClick={() => toggleFolderEditState(node.id)}>
      <i className="fa fa-check" />
    </button>
  </div>;

export const FolderNameEditor = (props: FolderNodeProps) => {
  const { node } = props;
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  return <div
    className={[
      "folder-list-item",
      (props.searchTerm && node.name.toLowerCase()
        .includes(props.searchTerm.toLowerCase()))
        ? "matched"
        : "",
      hovered ? "hovered" : "",
      props.movedSequenceUuid ? "moving" : "",
      !props.dragging ? "not-dragging" : "",
    ].join(" ")}
    onClick={() => props.onMoveEnd(node.id)}
    onDrop={e => {
      setHovered(false);
      dropSequence(node.id)(e);
      props.toggleSequenceMove();
    }}
    onDragOver={e => e.preventDefault()}
    onDragEnter={() => setHovered(true)}
    onDragLeave={() => setHovered(false)}>
    <i className={`fa fa-chevron-${node.open ? "down" : "right"}`}
      title={"Open/Close Folder"}
      onClick={() => toggleFolderOpenState(node.id)} />
    <div className={"drop-visual"} />
    <ColorPicker
      saucerIcon={[
        "fa",
        props.movedSequenceUuid ? "fa-folder-open" : "fa-folder",
      ].join(" ")}
      current={node.color}
      onChange={color => setFolderColor(node.id, color)} />
    <div className="folder-name">
      {node.editing
        ? <FolderNameInput node={node} />
        : <p>{node.name}</p>}
    </div>
    <Popover className="folder-settings-icon" usePortal={false}
      isOpen={settingsOpen}
      target={<i className={`fa fa-ellipsis-v ${settingsOpen ? "open" : ""}`}
        onClick={() => setSettingsOpen(!settingsOpen)} />}
      content={<FolderButtonCluster node={node}
        close={() => setSettingsOpen(false)} />} />
  </div>;
};

const FolderNode = (props: FolderNodeProps) => {
  const { node, sequences } = props;

  const sequenceItems = node.content
    .filter(seqUuid => sequences[seqUuid])
    .map(seqUuid =>
      <FolderListItem
        sequence={sequences[seqUuid]}
        key={"F" + seqUuid}
        dispatch={props.dispatch}
        variableData={props.sequenceMetas[seqUuid]}
        inUse={!!props.resourceUsage[seqUuid]}
        toggleSequenceMove={props.toggleSequenceMove}
        startSequenceMove={props.startSequenceMove}
        getWebAppConfigValue={props.getWebAppConfigValue}
        menuOpen={props.menuOpen}
        syncStatus={props.syncStatus}
        resources={props.resources}
        searchTerm={props.searchTerm}
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
      getWebAppConfigValue={props.getWebAppConfigValue}
      menuOpen={props.menuOpen}
      syncStatus={props.syncStatus}
      resources={props.resources}
      searchTerm={props.searchTerm}
      toggleSequenceMove={props.toggleSequenceMove}
      startSequenceMove={props.startSequenceMove}
      dragging={props.dragging}
      onMoveEnd={props.onMoveEnd} />);

  return <div className="folder">
    <FolderNameEditor {...props} />
    {!!node.open && <ul className="in-folder-sequences">{sequenceItems}</ul>}
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
          menuOpen={this.props.menuOpen}
          syncStatus={this.props.syncStatus}
          resources={this.props.resources}
          searchTerm={this.props.searchTerm}
          movedSequenceUuid={this.state.movedSequenceUuid}
          toggleSequenceMove={this.toggleSequenceMove}
          startSequenceMove={this.startSequenceMove}
          onMoveEnd={this.endSequenceMove}
          dragging={this.state.dragging}
          getWebAppConfigValue={this.props.getWebAppConfigValue}
          sequences={this.props.sequences} />;
      })}
    </div>;
  };

  toggleAll = () => {
    toggleAll(this.state.toggleDirection);
    this.setState({ toggleDirection: !this.state.toggleDirection });
  };

  startSequenceMove = (seqUuid: UUID) => this.setState({
    movedSequenceUuid: seqUuid,
    stashedUuid: this.state.movedSequenceUuid,
    dragging: true,
  });

  toggleSequenceMove = (seqUuid?: UUID) => this.setState({
    movedSequenceUuid: this.state.stashedUuid ? undefined : seqUuid,
    dragging: false,
  });

  endSequenceMove = (folderId: number) => {
    moveSequence(this.state.movedSequenceUuid || "", folderId);
    this.setState({ movedSequenceUuid: undefined, dragging: false });
  };

  rootSequences = () => this.props.rootFolder.noFolder
    .filter(seqUuid => this.props.sequences[seqUuid])
    .map(seqUuid =>
      <FolderListItem
        key={seqUuid}
        dispatch={this.props.dispatch}
        variableData={this.props.sequenceMetas[seqUuid]}
        inUse={!!this.props.resourceUsage[seqUuid]}
        sequence={this.props.sequences[seqUuid]}
        getWebAppConfigValue={this.props.getWebAppConfigValue}
        menuOpen={this.props.menuOpen}
        syncStatus={this.props.syncStatus}
        resources={this.props.resources}
        searchTerm={this.props.searchTerm}
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
        <this.Graph />
        <ul className="sequences-not-in-folders">
          {this.rootSequences()}
        </ul>
        <SequenceDropArea
          dropAreaVisible={!!this.state.movedSequenceUuid}
          onMoveEnd={this.endSequenceMove}
          toggleSequenceMove={this.toggleSequenceMove}
          folderId={0}
          folderName={"none"} />
      </EmptyStateWrapper>
    </div>;
  }
}

export const FolderPanelTop = (props: FolderPanelTopProps) => {
  const navigate = useNavigate();
  return <div className="panel-top with-button">
    <SearchField nameKey={"sequences"}
      placeholder={t("Search sequences...")}
      searchTerm={props.searchTerm || ""}
      onChange={updateSearchTerm} />
    <ToggleFolderBtn
      expanded={props.toggleDirection}
      onClick={props.toggleAll} />
    <button
      className="fb-button green"
      title={t("create subfolder")}
      onClick={() => { createFolder(); }}>
      <PlusStack icon={"fa-folder"} />
    </button>
    <button
      className="fb-button green"
      title={t("add new sequence")}
      onClick={() => { addNewSequenceToFolder(navigate); }}>
      <PlusStack icon={"fa-server"} />
    </button>
  </div>;
};
