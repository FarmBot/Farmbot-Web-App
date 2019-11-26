import { RootFolderNode, FolderUnion } from "./constants";

interface TreeClimberState {
  active: boolean;
}

interface VisitorProps {
  node: FolderUnion;
  callback: TreeClimber;
  halt: Halt;
  state: TreeClimberState;
}

type Halt = () => void;
type TreeClimber = (t: FolderUnion, halt: Function) => void;

function visit(p: VisitorProps) {
  const { node, callback, halt } = p;

  if (!p.state.active) { return; }

  callback(node, halt);

  switch (node.kind) {
    case "initial":
    case "medial":
      const children: FolderUnion[] = (node.children);
      return p.state.active && children.map(nextNode => {
        if (nextNode.kind == "medial") {
          visit({ ...p, node: nextNode });
        }
      });
    default:
      return;
  }
}

export const climb = (t: RootFolderNode, callback: TreeClimber) => {
  const state: TreeClimberState = { active: true };
  const halt = () => { state.active = false; };
  t.folders.map((node) => {
    const props = { node, callback, halt, state };
    state.active && visit(props);
  });
  return [];
};
