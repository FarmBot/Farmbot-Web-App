import React from "react";
import { Page, Col, Row } from "../ui";
import { ingest } from "./data_transfer";
import { sample } from "lodash";
import { Color } from "farmbot/dist/corpus";
import { FolderUnion } from "./constants";

interface Props {

}

interface State {

}

const list: Color[] = [
  "blue",
  "gray",
  "green",
  "orange",
  "pink",
  "purple",
  "red",
  "yellow"
];

const color = (): Color => sample(list) || "blue";

const TEST_GRAPH = ingest([
  { id: 1, parent_id: undefined, color: color(), name: "One" },
  { id: 2, parent_id: undefined, color: color(), name: "Two" },
  { id: 3, parent_id: 2, color: color(), name: "Three" },
  { id: 4, parent_id: undefined, color: color(), name: "Four" },
  { id: 5, parent_id: 4, color: color(), name: "Five" },
  { id: 6, parent_id: undefined, color: color(), name: "Six" },
  { id: 7, parent_id: 6, color: color(), name: "Seven" },
  { id: 8, parent_id: 7, color: color(), name: "Eight" },
  { id: 9, parent_id: 7, color: color(), name: "Nine" },
  { id: 10, parent_id: undefined, color: color(), name: "Ten" },
  { id: 11, parent_id: 10, color: color(), name: "Eleven" },
  { id: 12, parent_id: 10, color: color(), name: "Twelve" },
  { id: 13, parent_id: 12, color: color(), name: "Thirteen" },
  { id: 14, parent_id: undefined, color: color(), name: "Fourteen" },
  { id: 15, parent_id: 14, color: color(), name: "Fifteen" },
  { id: 16, parent_id: 14, color: color(), name: "Sixteen" },
  { id: 17, parent_id: 16, color: color(), name: "Seventeen" },
  { id: 18, parent_id: 16, color: color(), name: "Eighteen" }
]);

export class ScratchPad extends React.Component<Props, State> {
  Node = ({ node }: { node: FolderUnion }) => {
    const style: React.CSSProperties = {
      color: node.color,
      background: "black"
    };
    switch (node.kind) {
      case "initial":
        return <div style={style} >
          <span><button>Edit</button></span>
          <span><button>Delete</button></span>
          <span><input style={style} value={"folder " + node.name} onChange={() => { }} /></span>
          {node.children.map((n2: FolderUnion) => <this.Node node={n2} key={n2.id} />)}
        </div>;
      case "medial":
        return <div style={{ ...style, marginLeft: "30px" }} >
          <span><button>Edit</button></span>
          <span><button>Delete</button></span>
          <span><input style={style} value={"folder " + node.name} onChange={() => { }} /></span>
          {node.children.map((n2: FolderUnion) => <this.Node node={n2} key={n2.id} />)}
        </ div>;
      case "terminal":
        return <div style={{ ...style, marginLeft: "40px" }} >
          <span><button>Edit</button></span>
          <span><button>Delete</button></span>
          <span><input style={style} value={"folder " + node.name} onChange={() => { }} /></span>
        </div>;
    }
  }

  Graph = (_props: {}) => {
    return <div>
      {TEST_GRAPH.folders.map(grandparent => {
        return <this.Node node={grandparent} key={grandparent.id} />;
      })}
    </div>;
  }

  render() {
    return <Page>
      <Col xs={12} sm={6} smOffset={3}>
        <Row>
          <input placeholder={"Search"} disabled={true} />
          <button>
            Add Folder
          </button>
          <button>
            Add Sequence
          </button>
        </Row>
      </Col>
      <Col xs={12} sm={6} smOffset={3}>
        <Row> <this.Graph /> </Row>
      </Col>
    </Page>;
  }
}
