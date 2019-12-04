import React from "react";
import { Page, Col, Row, BlurableInput } from "../ui";
import { FolderUnion, RootFolderNode } from "./constants";
import { Everything } from "../interfaces";
import { connect } from "react-redux";
import { createFolder, deleteFolder, setFolderName } from "./actions";

type Props = RootFolderNode;
type State = {};

export class RawFolders extends React.Component<Props, State> {
  Node = ({ node }: { node: FolderUnion }) => {
    const style: React.CSSProperties =
      { color: node.color, background: "black" };
    const creates = () => createFolder({ parent_id: node.id });
    const deletes = () => deleteFolder(node.id);
    const subfolderBtn = <span>
      <button onClick={creates}>
        Subfolder
      </button>
    </span>;

    const deleteBtn = <span>
      <button onClick={deletes}>
        Delete
      </button>
    </span>;

    const inputBox = <span>
      <BlurableInput
        value={node.name}
        onCommit={({ currentTarget }) => {
          return setFolderName(node.id, currentTarget.value);
        }} />
    </span>;

    switch (node.kind) {
      case "initial":
        return <div style={style} >
          {subfolderBtn}
          {deleteBtn}
          {inputBox}
          {node.children.map((n2: FolderUnion) => <this.Node node={n2} key={n2.id} />)}
        </div>;
      case "medial":
        return <div style={{ ...style, marginLeft: "30px" }} >
          {subfolderBtn}
          {deleteBtn}
          {inputBox}
          {node.children.map((n2: FolderUnion) => <this.Node node={n2} key={n2.id} />)}
        </ div>;
      case "terminal":
        return <div style={{ ...style, marginLeft: "40px" }} >
          {deleteBtn}
          {inputBox}
        </div>;
    }
  }

  Graph = (_props: {}) => {
    return <div>
      {this.props.folders.map(grandparent => {
        return <this.Node node={grandparent} key={grandparent.id} />;
      })}
    </div>;
  }

  render() {
    return <Page>
      <Col xs={12} sm={6} smOffset={3}>
        <Row>
          <input placeholder={"Search"} disabled={true} />
          <button onClick={() => createFolder()}>
            Add Folder
          </button>
          <button>
            Add Sequence
          </button>
        </Row>
      </Col>
      <Col xs={12} sm={6} smOffset={3}>
        <Row> <this.Graph /> </Row>
        <Row>
          <pre>
            {JSON.stringify(this.props.folders, undefined, "  ")}
          </pre>
        </Row>
      </Col>
    </Page>;
  }
}

export function mapStateToProps(props: Everything): Props {
  return props.resources.index.sequenceFolders;
}

export const Folders = connect(mapStateToProps)(RawFolders);
