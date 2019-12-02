import { RootFolderNode, FolderUnion, FolderNodeMedial, FolderNodeInitial } from "./constants";
import { defensiveClone } from "../util";

interface TreeClimberState {
  active: boolean;
}

interface VisitorProps {
  node: FolderNodeInitial | FolderNodeMedial;
  callback: TreeClimber;
  halt: Halt;
  state: TreeClimberState;
}

type Halt = () => RootFolderNode;
type TreeClimber = (t: FolderUnion,
  /** Calling this function stops tree climb from continuing. */
  halt: Halt) => void;

function visit(p: VisitorProps) {
  const { node, callback, halt } = p;

  callback(node, halt);
  const children: FolderUnion[] = (node.children);
  return p.state.active && children.map(nextNode => {
    if (nextNode.kind != "terminal") {
      p.state.active && visit({ ...p, node: nextNode });
    } else {
      p.state.active && callback(nextNode, p.halt);
    }
  });
}

/** Recursively climb a directory structure. */
export const climb = (t: RootFolderNode, callback: TreeClimber) => {
  const state: TreeClimberState = { active: true };
  const halt = () => {
    state.active = false;
    return t;
  };
  t.folders.map((node) => {
    const props = { node, callback, halt, state };
    state.active && visit(props);
  });
  return t;
};

/** TODO: Create strategies for non-destructively
 * transforming a RootFolderNode. */
export const cloneAndClimb = (t: RootFolderNode, callback: TreeClimber) => {
  return climb(defensiveClone(t), callback);
};
