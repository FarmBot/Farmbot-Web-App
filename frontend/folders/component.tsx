import React, { useState } from "react";
import { BlurableInput, ColorPicker, Row, Col } from "../ui";
import {
  FolderUnion,
  FolderItemProps,
  FolderNodeProps,
  FolderProps,
  FolderState
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
import { urlFriendly } from "../util";
import { setActiveSequenceByName } from "../sequences/set_active_sequence_by_name";
import { Position } from "@blueprintjs/core";
import { t } from "../i18next_wrapper";
import { DeepPartial } from "redux";
import { Folder } from "farmbot/dist/resources/api_resources";

const FolderListItem = (props: FolderItemProps) => {
  const { sequence, onClick } = props;
  const url = `/app/sequences/${urlFriendly(sequence.body.name) || ""}`;
  return <li style={{ border: "1px dashed " + sequence.body.color }}>
    <i onClick={() => onClick(sequence.uuid)} className="fa fa-arrows">{""}</i>
    <Link to={url} key={sequence.uuid} onClick={setActiveSequenceByName}>
      {props.isMoveTarget ? "=>" : ""}{sequence.body.name}
    </Link>
  </li>;
};

interface FolderDropButtonProps {
  onClick(): void;
  active: boolean;
}

const DropFolderHereBtn = (props: FolderDropButtonProps) => {
  if (props.active) {
    return <div>
      <button onClick={props.onClick}> MOVE SEQUENCE TO FOLDER </button>
    </div>;
  } else {
    return <span />;
  }
};

interface AddFolderBtn { folder?: DeepPartial<Folder>; }

const AddFolderBtn = ({ folder }: AddFolderBtn) => {
  return <button title={"Create Subfolder"} onClick={() => createFolder(folder || {})}>
    +📁
  </button>;
};

interface AddSequenceProps { folderId?: number; }

const AddSequence = ({ folderId }: AddSequenceProps) =>
  <button onClick={() => addNewSequenceToFolder(folderId)}>+</button>;

const FolderButtonClusterActive = ({ node }: FolderNodeProps) => {
  return <div>
    <button
      title={"Open/Close Folder"}
      onClick={() => toggleFolderOpenState(node.id)}>
      {node.open ? "⬇️" : "➡️"}
    </button>
    {node.kind !== "terminal" && <AddFolderBtn folder={{ parent_id: node.id }} />}
    <button onClick={() => deleteFolder(node.id)}>🗑️</button>
    <button onClick={() => toggleFolderEditState(node.id)}>✎</button>
    <AddSequence folderId={node.id} />
  </div>;
};

const FolderButtonCluster = (props: FolderNodeProps) => {
  const { node } = props;
  if (props.movedSequenceUuid) {
    return <DropFolderHereBtn
      active={true}
      onClick={() => props.onMoveEnd(node.id)} />;
  } else {
    return <FolderButtonClusterActive {...props} />;
  }
};

const FolderNameEditor = (props: FolderNodeProps) => {
  const { node } = props;

  const onCommit = (e: React.SyntheticEvent<HTMLInputElement, Event>) => {
    const { currentTarget } = e;
    return setFolderName(node.id, currentTarget.value)
      .then(() => toggleFolderEditState(node.id));
  };
  let namePart: JSX.Element;

  if (node.editing) {
    namePart = <BlurableInput value={node.name} onCommit={onCommit} />;
  } else {
    namePart = <span>{node.name}</span>;
  }

  let buttonPart: JSX.Element;
  const [isOpen, changeOpenState] = useState(false);
  if (isOpen) {
    buttonPart = <FolderButtonCluster {...props} />;
  } else {
    buttonPart = <div>Hmm...</div>;
  }

  return <div>
    <button onClick={() => { changeOpenState(!isOpen); }}> ... </button>
    {namePart}
    {buttonPart}
  </div>;
};

const FolderNode = (props: FolderNodeProps) => {
  const { node, sequences } = props;

  const names = node
    .content
    .map(x => <FolderListItem
      sequence={sequences[x]}
      key={"F" + x}
      onClick={props.onMoveStart}
      isMoveTarget={props.movedSequenceUuid === x} />);

  const children = <ul> {names} </ul>;
  const mapper = (n2: FolderUnion) => <FolderNode
    node={n2}
    key={n2.id}
    sequences={sequences}
    movedSequenceUuid={props.movedSequenceUuid}
    onMoveStart={props.onMoveStart}
    onMoveEnd={props.onMoveEnd} />;
  const array: FolderUnion[] = node.children || [];
  const stuff: { jsx: JSX.Element[], margin: number } =
    ({ jsx: array.map(mapper), margin: 10 });
  return <div
    style={{ marginLeft: `${stuff.margin}px`, border: "2px solid " + node.color }}>
    <FolderButtonCluster {...props} />
    <Row>
      <Col xs={12} className="color-picker-col">
        <ColorPicker
          position={Position.LEFT}
          onChange={(color) => setFolderColor(node.id, color)}
          current={node.color} />
        <FolderNameEditor {...props} />
      </Col>
    </Row>
    {!!node.open && children}
    {!!node.open && stuff.jsx}
  </div>;
};

export class Folders extends React.Component<FolderProps, FolderState> {
  state: FolderState = { toggleDirection: true };

  Graph = (_props: {}) => {

    return <div>
      {this.props.rootFolder.folders.map(grandparent => {
        return <FolderNode
          node={grandparent}
          key={grandparent.id}
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
    .map(x => <FolderListItem
      key={x}
      sequence={this.props.sequences[x]}
      onClick={this.startSequenceMove}
      isMoveTarget={this.state.movedSequenceUuid === x} />);

  render() {
    return <div>
      <h1>{t("Sequences")}</h1>
      <input
        placeholder={"Search sequences and subfolders..."}
        value={this.props.searchTerm || ""}
        onChange={({ currentTarget }) => { updateSearchTerm(currentTarget.value); }} />
      <button onClick={this.toggleAll}>{this.state.toggleDirection ? "📂" : "📁"}</button>
      <AddFolderBtn />
      <AddSequence />
      <this.Graph />
      <DropFolderHereBtn
        onClick={() => this.endSequenceMove(0)}
        active={!!this.state.movedSequenceUuid} />
      <ul> {this.rootSequences()} </ul>
    </div>;
  }
}
