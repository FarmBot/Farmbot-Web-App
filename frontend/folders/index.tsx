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

const CSS_MARGINS: Record<FolderUnion["kind"], number> = {
  "initial": 0,
  "medial": 45,
  "terminal": 46
};

interface FolderItemProps {
  sequence: TaggedSequence;
}

const FolderItem = ({ sequence }: FolderItemProps) => {
  return <li>*{sequence.body.name}</li>;
};

const FolderNode = ({ node, sequences }: FolderNodeProps) => {
  const subfolderBtn = <button onClick={() => createFolder({ parent_id: node.id })}>📁</button>;

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

  const names = node.content.map(x => <FolderItem sequence={sequences[x]} key={"F" + x} />);

  const children = <ul> {names} </ul>;
  const mapper = (n2: FolderUnion) => <FolderNode node={n2} key={n2.id} sequences={sequences} />;
  const array: FolderUnion[] = node.children || [];
  const stuff: { jsx: JSX.Element[], margin: number } =
    ({ jsx: array.map(mapper), margin: CSS_MARGINS[node.kind] });
  return <div style={{ marginLeft: `${stuff.margin}px` }}>
    <button onClick={() => toggleFolderOpenState(node.id)}>
      {node.open ? "⬇️" : "➡️"}
    </button>
    {node.kind !== "terminal" && subfolderBtn}
    <button onClick={() => deleteFolder(node.id)}>🗑️</button>
    <button onClick={() => toggleFolderEditState(node.id)}>✎</button>
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
    const rootSequences = this
      .props
      .noFolder
      .map(x => <FolderItem key={x} sequence={this.props.sequences[x]} />);

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
          <hr />
          <ul> {rootSequences} </ul>
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
