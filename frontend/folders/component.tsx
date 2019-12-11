import React from "react";
import { BlurableInput } from "../ui";
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

interface FolderItemProps {
  sequence: TaggedSequence;
}

const CSS_MARGINS: Record<FolderUnion["kind"], number> = {
  "initial": 0,
  "medial": 20,
  "terminal": 23
};

// // TODO: Get this working again!
// const SequenceListItem = (props: SequenceListItemProps) =>
//   (ts: TaggedSequence) => {
//     const inUse = !!props.resourceUsage[ts.uuid];
//     const variableData = props.sequenceMetas[ts.uuid];
//     const deleteSeq = () => props.dispatch(destroy(ts.uuid));

//     return <div className="sequence-list-item" key={ts.uuid}>
//       {DevSettings.quickDeleteEnabled()
//         ? <SequenceButton ts={ts} inUse={inUse} deleteFunc={deleteSeq} />
//         : <SequenceButtonWrapper
//           ts={ts} dispatch={props.dispatch} variableData={variableData}>
//           <SequenceButton ts={ts} inUse={inUse} />
//         </SequenceButtonWrapper>}
//     </div>;
//   };

const FolderItem = ({ sequence }: FolderItemProps) => {
  return <li style={{ border: "1px dashed " + sequence.body.color }}>*{sequence.body.name}</li>;
};

const FolderNode = ({ node, sequences }: FolderNodeProps) => {
  const subfolderBtn =
    <button onClick={() => createFolder({ parent_id: node.id })}>📁</button>;

  const inputBox = <BlurableInput
    value={node.name}
    onCommit={({ currentTarget }) => {
      return setFolderName(node.id, currentTarget.value)
        .then(() => toggleFolderEditState(node.id));
    }} />;

  const names = node
    .content
    .map(x => <FolderItem sequence={sequences[x]} key={"F" + x} />);

  const children = <ul> {names} </ul>;
  const mapper = (n2: FolderUnion) => <FolderNode node={n2} key={n2.id} sequences={sequences} />;
  const array: FolderUnion[] = node.children || [];
  const stuff: { jsx: JSX.Element[], margin: number } =
    ({ jsx: array.map(mapper), margin: CSS_MARGINS[node.kind] });
  return <div style={{ marginLeft: `${stuff.margin}px`, border: "1px dashed " + node.color }}>
    <div>
      <button onClick={() => toggleFolderOpenState(node.id)}>
        {node.open ? "⬇️" : "➡️"}
      </button>
      {node.kind !== "terminal" && subfolderBtn}
      <button onClick={() => deleteFolder(node.id)}>🗑️</button>
      <button onClick={() => toggleFolderEditState(node.id)}>✎</button>
    </div>
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

    return <div>
      <input
        value={this.props.searchTerm || ""}
        onChange={({ currentTarget }) => { updateSearchTerm(currentTarget.value); }} />
      <button onClick={() => createFolder()}>📁</button>
      <button onClick={this.toggleAll}>{this.state.toggleDirection ? "📂" : "📁"}</button>
      <button>➕Sequence</button>
      <this.Graph />
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
