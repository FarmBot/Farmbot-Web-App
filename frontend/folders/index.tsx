import React from "react";
import { Page, Col, Row, BlurableInput } from "../ui";
import { FolderUnion, RootFolderNode } from "./constants";
import { Everything } from "../interfaces";
import { connect } from "react-redux";
import { createFolder, deleteFolder, setFolderName } from "./actions";
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
  const toggleBtn = <a onClick={() => { }}> {node.open ? "➕" : "➖"} </a>;

  const inputBox = <BlurableInput
    value={node.name}
    onCommit={({ currentTarget }) => {
      return setFolderName(node.id, currentTarget.value);
    }} />;
  const names = node
    .content
    .map(x => <li>*{sequences[x].body.name}</li>);

  const children = <ul> {names} </ul>;

  switch (node.kind) {
    case "initial":
      return <div>
        {toggleBtn}
        {subfolderBtn}
        {deleteBtn}
        {inputBox}
        {children}
        {node.children.map((n2: FolderUnion) => <FolderNode
          node={n2}
          key={n2.id}
          sequences={sequences} />)}
      </div>;
    case "medial":
      return <div style={{ marginLeft: "30px" }} >
        {toggleBtn}
        {subfolderBtn}
        {deleteBtn}
        {inputBox}
        {children}
        {node.children.map((n2: FolderUnion) => <FolderNode
          node={n2}
          key={n2.id}
          sequences={sequences} />)}
      </div>;
    case "terminal":
      return <div style={{ marginLeft: "40px" }} >
        {toggleBtn}
        {deleteBtn}
        {inputBox}
        {children}
      </div>;
  }
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
          <button onClick={() => createFolder()}>
            ➕Folder
          </button>
          <button>
            ➕Sequence
          </button>
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
  return {
    ...props.resources.index.sequenceFolders,
    sequences: selectAllSequences(props.resources.index)
      .reduce((a: Props["sequences"], b) => {
        a[b.uuid] = b;
        return a;
      }, {})
  };
}
export const Folders = connect(mapStateToProps)(RawFolders);
