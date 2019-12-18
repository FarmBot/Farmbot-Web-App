import React from "react";
import { BlurableInput, ColorPicker, Row, Col, ToolTip } from "../ui";
import {
  FolderUnion,
  FolderItemProps,
  FolderNodeProps,
  FolderProps,
  FolderState,
  FolderDropButtonProps,
  AddFolderBtn,
  AddSequenceProps
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
import { Position, Popover } from "@blueprintjs/core";
import { t } from "../i18next_wrapper";
import { ToolTips } from "../constants";

const FolderListItem = (props: FolderItemProps) => {
  const { sequence, onClick } = props;
  const url = `/app/sequences/${urlFriendly(sequence.body.name) || ""}`;
  const style = props.isMoveTarget ? { border: "1px solid red" } : {};
  return <li style={style}>
    <i onClick={() => onClick(sequence.uuid)} className="fa fa-arrows">{""}</i>
    <Link to={url} key={sequence.uuid} onClick={setActiveSequenceByName}>
      {sequence.body.name}
    </Link>
  </li>;
};

interface ToggleFolderBtnProps {
  expanded: boolean;
  onClick(): void;
}
const ToggleFolderBtn = (p: ToggleFolderBtnProps) => {
  const klass = `fa fa-${p.expanded ? "plus" : "minus"}-square`;
  return <i className={klass} onClick={p.onClick}>
  </i>;
};
const DropFolderHereBtn = (props: FolderDropButtonProps) => {
  if (props.active) {
    return <button className="drag-drop-area visible" onClick={props.onClick}>
      Move sequence here
    </button>;
  } else {
    return <span />;
  }
};

const AddFolderBtn = ({ folder }: AddFolderBtn) => {
  return <i
    title={"Create Subfolder"}
    onClick={() => createFolder(folder || {})}
    className="fa fa-folder" />;
};

const AddSequence = ({ folderId }: AddSequenceProps) => <i
  className="fa fa-server"
  onClick={() => addNewSequenceToFolder(folderId)} />;

const FolderButtonCluster = ({ node }: FolderNodeProps) => {
  return <div style={{ display: "flex" }}>
    <ColorPicker
      position={Position.LEFT}
      onChange={(color) => setFolderColor(node.id, color)}
      current={node.color} />
    {node.kind !== "terminal" && <AddFolderBtn folder={{ parent_id: node.id }} />}
    <i className="fa fa-trash" onClick={() => deleteFolder(node.id)} />
    <i className="fa fa-pencil" onClick={() => toggleFolderEditState(node.id)} />
    <AddSequence folderId={node.id} />
  </div>;
};

const FolderNameEditor = (props: FolderNodeProps) => {
  const { node } = props;

  if (props.movedSequenceUuid) {
    return <DropFolderHereBtn
      active={true}
      onClick={() => props.onMoveEnd(node.id)} />;
  }

  const onCommit = (e: React.SyntheticEvent<HTMLInputElement, Event>) => {
    const { currentTarget } = e;
    return setFolderName(node.id, currentTarget.value)
      .then(() => toggleFolderEditState(node.id));
  };
  let namePart: JSX.Element;
  const btnColor = "fb-btn " + node.color;
  const toggle = () => toggleFolderOpenState(node.id);

  if (node.editing) {
    namePart = <BlurableInput value={node.name} onCommit={onCommit} />;
  } else {
    namePart = <span className={btnColor} onClick={toggle}>{node.name}</span>;
  }
  const buttonPart = <Popover>
    <i className={btnColor + " fa fa-gear"} />
    <FolderButtonCluster {...props} />
  </Popover>;
  const faIcon = ` fa fa-chevron-${node.open ? "down" : "right"}`;
  return <div style={{ display: "flex", cursor: "pointer" }}>
    <i
      className={btnColor + faIcon}
      title={"Open/Close Folder"}
      onClick={toggle}>
    </i>
    {buttonPart}
    {namePart}
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

  const children = <ul> {names} </ul>;
  const mapper = (n2: FolderUnion) => <FolderNode
    node={n2}
    key={n2.id}
    sequences={sequences}
    movedSequenceUuid={props.movedSequenceUuid}
    onMoveStart={props.onMoveStart}
    onMoveEnd={props.onMoveEnd} />;
  const array: FolderUnion[] = node.children || [];
  return <div style={{ marginLeft: 10 }}>
    <Row>
      <Col xs={12} className="color-picker-col">
        <FolderNameEditor {...props} />
      </Col>
    </Row>
    {!!node.open && children}
    {!!node.open && array.map(mapper)}
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
    .map(x => <FolderListItem
      key={x}
      sequence={this.props.sequences[x]}
      onClick={this.startSequenceMove}
      isMoveTarget={this.state.movedSequenceUuid === x} />);

  render() {
    return <div>
      <h3>{t("Sequences")}</h3>
      <ToolTip helpText={ToolTips.SEQUENCE_LIST} />
      <div className="panel-top with-button">
        <div className="thin-search-wrapper">
          <div className="text-input-wrapper">
            <i className="fa fa-search" />
            <input
              value={this.props.searchTerm || ""}
              onChange={({ currentTarget }) => { updateSearchTerm(currentTarget.value); }}
              type="text"
              placeholder={t("Search sequences")} />
          </div>
        </div>
        <ToggleFolderBtn
          expanded={this.state.toggleDirection}
          onClick={this.toggleAll} />
        <AddSequence />
        <AddFolderBtn />
      </div>
      <DropFolderHereBtn
        onClick={() => this.endSequenceMove(0)}
        active={!!this.state.movedSequenceUuid} />
      <this.Graph />
      <ul> {this.rootSequences()} </ul>
    </div>;
  }
}
