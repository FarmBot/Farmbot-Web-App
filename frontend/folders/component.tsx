import React from "react";
import { BlurableInput, ColorPicker, Row, Col } from "../ui";
import { FolderUnion, RootFolderNode } from "./constants";
import { Everything } from "../interfaces";
import { connect } from "react-redux";
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
import { TaggedSequence } from "farmbot";
import { selectAllSequences } from "../resources/selectors";
import { Link } from "../link";
import { urlFriendly } from "../util";
import { setActiveSequenceByName } from "../sequences/set_active_sequence_by_name";
import { Position } from "@blueprintjs/core";

interface Props extends RootFolderNode {
  sequences: Record<string, TaggedSequence>;
  searchTerm: string | undefined;
}

type State = {
  toggleDirection: boolean;
  movedSequenceUuid?: string;
};

interface FolderNodeProps {
  node: FolderUnion;
  sequences: Record<string, TaggedSequence>;
  movedSequenceUuid: string | undefined;
  onMoveStart(sequenceUuid: string): void;
  onMoveEnd(folderId: number): void;
}

interface FolderItemProps {
  onClick(sequenceUuid: string): void;
  sequence: TaggedSequence;
  isMoveTarget: boolean;
}

const CSS_MARGINS: Record<FolderUnion["kind"], number> = {
  "initial": 0,
  "medial": 10,
  "terminal": 10
};

const FolderItem = (props: FolderItemProps) => {
  const { sequence, onClick } = props;
  return <li style={{ border: "1px dashed " + sequence.body.color }}>
    <i onClick={() => onClick(sequence.uuid)} className="fa fa-arrows">{""}</i>
    <Link
      to={`/app/sequences/${urlFriendly(sequence.body.name) || ""}`}
      key={sequence.uuid}
      onClick={setActiveSequenceByName}>
      {props.isMoveTarget ? "=>" : ""}{sequence.body.name}
    </Link>
  </li>;
};

interface FolderDropButtonProps {
  onClick(): void;
}

const FolderDropButton = (props: FolderDropButtonProps) => <div>
  <button onClick={props.onClick}>
    MOVE SEQUENCE TO FOLDER
</button>
</div>;

const FolderNode = (props: FolderNodeProps) => {
  const { node, sequences } = props;
  const subfolderBtn =
    <button
      title={"Create Subfolder"}
      onClick={() => createFolder({ parent_id: node.id })}>
      +📁
    </button>;

  const inputBox = <Row>
    <Col xs={1} className="color-picker-col">
      <ColorPicker
        position={Position.LEFT}
        onChange={(color) => setFolderColor(node.id, color)}
        current={node.color} />
    </Col>
    <Col xs={11}>
      {!node.editing && node.name}
      {node.editing && <BlurableInput
        value={node.name}
        onCommit={({ currentTarget }) => {
          return setFolderName(node.id, currentTarget.value)
            .then(() => toggleFolderEditState(node.id));
        }} />}
    </Col>
  </Row>;

  const names = node
    .content
    .map(x => <FolderItem
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
    onMoveEnd={props.onMoveEnd}
  />;
  const array: FolderUnion[] = node.children || [];
  const stuff: { jsx: JSX.Element[], margin: number } =
    ({ jsx: array.map(mapper), margin: CSS_MARGINS[node.kind] });
  const moverBtn = <FolderDropButton onClick={() => props.onMoveEnd(node.id)} />;
  const normalButtons = <div>
    <button
      title={"Open/Close Folder"}
      onClick={() => toggleFolderOpenState(node.id)}>
      {node.open ? "⬇️" : "➡️"}
    </button>
    {node.kind !== "terminal" && subfolderBtn}
    <button onClick={() => deleteFolder(node.id)}>🗑️</button>
    <button onClick={() => toggleFolderEditState(node.id)}>✎</button>
    <button onClick={() => addNewSequenceToFolder(node.id)}>+</button>
  </div>;
  return <div
    style={{ marginLeft: `${stuff.margin}px`, border: "2px solid " + node.color }}>
    {props.movedSequenceUuid ? moverBtn : normalButtons}
    {inputBox}
    {!!node.open && children}
    {!!node.open && stuff.jsx}
  </div>;
};

export class RawFolders extends React.Component<Props, State> {
  state: State = { toggleDirection: true };

  Graph = (_props: {}) => {
    return <div>
      {this.props.folders.map(grandparent => {
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

  render() {
    const rootSequences = this
      .props
      .noFolder
      .map(x => <FolderItem
        key={x}
        sequence={this.props.sequences[x]}
        onClick={this.startSequenceMove}
        isMoveTarget={this.state.movedSequenceUuid === x} />);

    return <div>
      <input
        placeholder={"Search sequences and subfolders..."}
        value={this.props.searchTerm || ""}
        onChange={({ currentTarget }) => { updateSearchTerm(currentTarget.value); }} />
      <button onClick={this.toggleAll}>{this.state.toggleDirection ? "📂" : "📁"}</button>
      <button onClick={() => createFolder()}>+📁</button>
      <button title="+Sequence">+</button>
      <this.Graph />
      {this.state.movedSequenceUuid && <FolderDropButton onClick={() => this.endSequenceMove(0)} />}
      <ul>
        {rootSequences}
      </ul>
    </div>;
  }
}

export function mapStateToProps(props: Everything): Props {
  type Reducer = (a: Props["sequences"], b: TaggedSequence) =>
    Record<string, TaggedSequence>;

  const reduce: Reducer = (a, b) => {
    a[b.uuid] = b;
    return a;
  };

  const x = props.resources.index.sequenceFolders;

  return {
    folders: x.filteredFolders ? x.filteredFolders.folders : x.folders.folders,
    noFolder: x.folders.noFolder,
    sequences: selectAllSequences(props.resources.index).reduce(reduce, {}),
    searchTerm: x.searchTerm
  };
}

export const Folders = connect(mapStateToProps)(RawFolders);
