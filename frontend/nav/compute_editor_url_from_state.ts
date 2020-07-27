import { store } from "../redux/store";
import { urlFriendly } from "../util";
import { LinkComputeFn } from "./nav_links";

export const computeEditorUrlFromState =
  (resource: "Sequence" | "Regimen", designer = true): LinkComputeFn => {
    return () => {
      const { resources } = store.getState();
      const current = resource === "Sequence"
        ? resources.consumers.sequences.current
        : resources.consumers.regimens.currentRegimen;
      const r = resources.index.references[current || ""];
      const base = `/app/${designer ? "designer/" : ""}${
        resource === "Sequence" ? "sequences" : "regimens"}/`;
      if (r?.kind == resource) {
        return base + urlFriendly(r.body.name);
      } else {
        return base;
      }
    };
  };
