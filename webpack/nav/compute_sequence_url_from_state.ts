import { store } from "../redux/store";
import { urlFriendly } from "../util";
import { LinkComputeFn } from "./nav_links";

export const computeSequenceUrlFromState: LinkComputeFn = () => {
  const { resources } = store.getState();
  const { current } = resources.consumers.sequences;
  const s = resources.index.references[current || ""];
  const base = "/app/sequences/";
  if (s && s.kind == "Sequence") {
    return base + urlFriendly(s.body.name);
  } else {
    return base;
  }
};
