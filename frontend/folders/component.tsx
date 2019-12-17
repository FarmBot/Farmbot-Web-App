import React from "react";
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

const FolderItem = (props: FolderItemProps) => {
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
    ({ jsx: array.map(mapper), margin: 10 });
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
    <Row>
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
    .map(x => <FolderItem
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
      <button onClick={() => createFolder()}>+📁</button>
      <button onClick={() => addNewSequenceToFolder(0)}>+</button>
      <this.Graph />
      {this.state.movedSequenceUuid && <FolderDropButton onClick={() => this.endSequenceMove(0)} />}
      <ul>
        {this.rootSequences()}
      </ul>
    </div>;
  }
}