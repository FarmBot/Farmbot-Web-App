import React from "react";
import { Page, Col, Row, BlurableInput } from "../ui";
import { FolderUnion, RootFolderNode } from "./constants";
import { Everything } from "../interfaces";
import { connect } from "react-redux";
import { createFolder, deleteFolder, setFolderName, toggleFolderOpenState } from "./actions";
import { TaggedSequence } from "farmbot";
import { selectAllSequences } from "../resources/selectors";

interface Props extends RootFolderNode {
  sequences: Record<string, TaggedSequence>;
}

type State = {};

interface FolderNodeProps {
  node: FolderUnion;
  sequences: Record<string, TaggedSequence>;
}

const FolderNode = ({ node, sequences }: FolderNodeProps) => {
  const creates = () => createFolder({ parent_id: node.id });
  const deletes = () => deleteFolder(node.id);

  const subfolderBtn = <a onClick={creates}>📁</a>;
  const deleteBtn = <a onClick={deletes}>🗑️</a>;
  const toggleBtn = <a onClick={() => toggleFolderOpenState(node.id)}>
    {node.open ? "➕" : "➖"}
  </a>;
  const editBtn = <a onClick={() => alert("TODO")}>✎</a>;

  const inputBox = <BlurableInput
    value={node.name}
    onCommit={({ currentTarget }) => {
      return setFolderName(node.id, currentTarget.value);
    }} />;
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
      stuff.margin = 40;
      stuff.jsx = node.children.map((n2: FolderUnion) => <FolderNode
        node={n2}
        key={"Y" + n2.id}
        sequences={sequences} />);
      break;
    case "terminal":
      stuff.margin = 60;
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

  render() {
    return <Page>
      <Col xs={12} sm={6} smOffset={3}>
        <Row>
          <input placeholder={"Search"} disabled={true} />
          <button onClick={() => createFolder()}>➕Folder</button>
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
  const x = props.resources.index.sequenceFolders;
  const reduce =
    (a: Props["sequences"], b: TaggedSequence): Record<string, TaggedSequence> => {
      a[b.uuid] = b;
      return a;
    };
  return {
    folders: x.folders.folders,
    noFolder: x.folders.noFolder,
    sequences: selectAllSequences(props.resources.index).reduce(reduce, {})
  };
}
export const Folders = connect(mapStateToProps)(RawFolders);
