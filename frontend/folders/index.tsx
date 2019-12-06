import React from "react";
import { Page, Col, Row, BlurableInput } from "../ui";
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
  updateSearchTerm
} from "./actions";
import { TaggedSequence } from "farmbot";
import { selectAllSequences } from "../resources/selectors";

interface Props extends RootFolderNode {
  sequences: Record<string, TaggedSequence>;
  searchTerm: string | undefined;
}

type State = {
  toggleDirection: boolean;
};

interface FolderNodeProps {
  node: FolderUnion;
  sequences: Record<string, TaggedSequence>;
}

const FolderNode = ({ node, sequences }: FolderNodeProps) => {
  const creates = () => createFolder({ parent_id: node.id });
  const deletes = () => deleteFolder(node.id);

  const subfolderBtn = <button onClick={creates}>📁</button>;
  const deleteBtn = <button onClick={deletes}>🗑️</button>;
  const toggleBtn = <button onClick={() => toggleFolderOpenState(node.id)}>
    {node.open ? "⬇️" : "➡️"}
  </button>;
  const editBtn = <button onClick={() => toggleFolderEditState(node.id)}>✎</button>;

  let inputBox: JSX.Element;
  if (node.editing) {
    inputBox = <BlurableInput
      value={node.name}
      onCommit={({ currentTarget }) => {
        return setFolderName(node.id, currentTarget.value)
          .then(() => toggleFolderEditState(node.id));
      }} />;
  } else {
    inputBox = <span>{node.name}</span>;
  }
  const names = node
    .content
    .map(x => <li key={"Z" + node.id + sequences[x].uuid}>*{sequences[x].body.name}</li>);

  const children = <ul> {names} </ul>;
  const stuff: { jsx: JSX.Element[], margin: number } =
    ({ jsx: [], margin: 0 });

  switch (node.kind) {
    case "initial":
      stuff.jsx = node.children.map((n2: FolderUnion) => <FolderNode
        node={n2}
        key={"X" + n2.id}
        sequences={sequences} />);
      break;
    case "medial":
      stuff.margin = 45;
      stuff.jsx = node.children.map((n2: FolderUnion) => <FolderNode
        node={n2}
        key={"Y" + n2.id}
        sequences={sequences} />);
      break;
    case "terminal":
      stuff.margin = 46;
      break;
  }
  return <div style={{ marginLeft: `${stuff.margin}px` }}>
    {toggleBtn}
    {node.kind !== "terminal" && subfolderBtn}
    {deleteBtn}
    {editBtn}
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
          sequences={this.props.sequences} />;
      })}
    </div>;
  }

  toggleAll = () => {
    toggleAll(this.state.toggleDirection);
    this.setState({ toggleDirection: !this.state.toggleDirection });
  }

  render() {
    return <Page>
      <Col xs={12} sm={6} smOffset={3}>
        <Row>
          <input
            value={this.props.searchTerm || ""}
            onChange={({ currentTarget }) => {
              updateSearchTerm(currentTarget.value);
            }} />
          <button onClick={() => createFolder()}>📁</button>
          <button onClick={this.toggleAll}>{this.state.toggleDirection ? "📂" : "📁"}</button>
          <button>➕Sequence</button>
        </Row>
      </Col>
      <Col xs={12} sm={6} smOffset={3}>
        <Row>
          <this.Graph />
        </Row>
      </Col>
    </Page>;
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
