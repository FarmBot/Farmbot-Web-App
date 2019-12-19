import React from "react";
import { BlurableInput, Row, Col, ColorPickerCluster } from "../ui";
import {
  FolderUnion,
  FolderItemProps,
  FolderNodeProps,
  FolderProps,
  FolderState,
  AddFolderBtn,
  AddSequenceProps,
  ToggleFolderBtnProps
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
import { Popover } from "@blueprintjs/core";
import { t } from "../i18next_wrapper";

const FOLDER_LIST_ITEM: React.StyleHTMLAttributes<HTMLDivElement>["style"] = {
  backgroundColor: "#ddd",
  borderBottom: "1px solid #aaa",
  padding: "0.5rem",
  cursor: "pointer",
  height: "3.5rem"
};
const UL_STYLE = { marginBottom: "0px" };
const FLEX = { display: "flex" };
const FOLDER_NODE_WRAPPER = { marginLeft: 10 };
const FOLDER_PANEL_WRAPPER = { marginTop: 0 };

const FolderListItem = (props: FolderItemProps) => {
  const { sequence, onClick } = props;
  const url = `/app/sequences/${urlFriendly(sequence.body.name) || ""}`;
  const style = props.isMoveTarget ? { border: "1px solid red" } : {};
  return <li style={{ ...style, ...FOLDER_LIST_ITEM }}>
    <i onClick={() => onClick(sequence.uuid)} className="fa fa-arrows-v float-right" />
    <Link to={url} key={sequence.uuid} onClick={setActiveSequenceByName}>
      {sequence.body.name}
    </Link>
  </li>;
};

const ToggleFolderBtn = (p: ToggleFolderBtnProps) => {
  const klass = `fa fa-${p.expanded ? "plus" : "minus"}-square`;
  return <button className="fb-button gray">
    <i className={klass} onClick={p.onClick} />
  </button>;
};

const AddFolderBtn = ({ folder }: AddFolderBtn) => {
  return <button className="fb-button green">
    <i
      title={"Create Subfolder"}
      onClick={() => createFolder(folder || {})}
      className="fa fa-folder" />
  </button>;
};

const AddSequenceBtn = ({ folderId }: AddSequenceProps) => {
  return <button className="fb-button green">
    <i className="fa fa-server" onClick={() => addNewSequenceToFolder(folderId)} />
  </button>;
};

const FolderButtonCluster = ({ node }: FolderNodeProps) => {
  return <div style={FLEX}>
    <button className="fb-button red">
      <i className="fa fa-trash" onClick={() => deleteFolder(node.id)} />
    </button>
    <button className="fb-button gray">
      <i className="fa fa-pencil" onClick={() => toggleFolderEditState(node.id)} />
    </button>
    {node.kind !== "terminal" && <AddFolderBtn folder={{ parent_id: node.id }} />}
    <AddSequenceBtn folderId={node.id} />
  </div>;
};

const FolderNameEditor = (props: FolderNodeProps) => {
  const { node } = props;

  const onCommit = (e: React.SyntheticEvent<HTMLInputElement, Event>) => {
    const { currentTarget } = e;
    return setFolderName(node.id, currentTarget.value)
      .then(() => toggleFolderEditState(node.id));
  };
  let namePart: JSX.Element;
  const toggle = () => toggleFolderOpenState(node.id);
  const nodeName = props.movedSequenceUuid ?
    t("CLICK TO MOVE HERE") : node.name;
  if (node.editing) {
    namePart = <BlurableInput value={nodeName} onCommit={onCommit} />;
  } else {
    namePart = <span onClick={toggle}> {nodeName}</span>;
  }

  const faIcon = ` fa fa-chevron-${node.open ? "down" : "right"}`;
  const style = {
    ...FOLDER_LIST_ITEM,
    ...(props.movedSequenceUuid ? { backgroundColor: "#bbb" } : {})
  };
  const onClick =
    props.movedSequenceUuid ? () => props.onMoveEnd(node.id) : () => { };
  return <div style={style} onClick={onClick}>
    <i
      className={"float-left" + faIcon}
      title={"Open/Close Folder"}
      onClick={toggle} />
    <div className={"float-left"}>
      <Popover>
        <i className="fa fa-folder" style={{ color: node.color }} />
        <ColorPickerCluster
          current={node.color}
          onChange={(color) => setFolderColor(node.id, color)} />
      </Popover>
    </div>
    {namePart}
    <div className={"float-right"}>
      <Popover>
        <i className={"fa fa-ellipsis-v"} />
        <FolderButtonCluster {...props} />
      </Popover>
    </div>
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

  const children = <ul style={UL_STYLE}> {names} </ul>;
  const mapper = (n2: FolderUnion) => <FolderNode
    node={n2}
    key={n2.id}
    sequences={sequences}
    movedSequenceUuid={props.movedSequenceUuid}
    onMoveStart={props.onMoveStart}
    onMoveEnd={props.onMoveEnd} />;
  const array: FolderUnion[] = node.children || [];
  return <div style={FOLDER_NODE_WRAPPER}>
    <Row>
      <Col xs={12}>
        <FolderNameEditor {...props} />
      </Col>
    </Row>
    {!!node.open && children}
    {!!node.open && array.map(mapper)}
  </div>;
};

export class Folders extends React.Component<FolderProps, FolderState> {
  state: FolderState = { toggleDirection: false };

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
      <div className="panel-top with-button" style={FOLDER_PANEL_WRAPPER}>
        <div className="thin-search-wrapper">
          <div className="text-input-wrapper">
            <i className="fa fa-search" />
            <input
              value={this.props.searchTerm || ""}
              onChange={({ currentTarget }) => {
                updateSearchTerm(currentTarget.value);
              }}
              type="text"
              placeholder={t("Search sequences")} />
          </div>
        </div>
        <ToggleFolderBtn
          expanded={this.state.toggleDirection}
          onClick={this.toggleAll} />
        <AddFolderBtn />
        <AddSequenceBtn />
      </div>
      {/* <DropFolderHereBtn
        onClick={() => this.endSequenceMove(0)}
        active={!!this.state.movedSequenceUuid} /> */}
      <ul style={UL_STYLE}>
        {this.rootSequences()}
      </ul>
      <this.Graph />
    </div>;
  }
}
