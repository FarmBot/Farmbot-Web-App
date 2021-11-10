import { Path } from "../internal_urls";
import { store } from "../redux/store";
import { urlFriendly } from "../util";

export const computeEditorUrlFromState =
  (resource: "Sequence" | "Regimen"): () => string => {
    return () => {
      const { resources } = store.getState();
      const current = resource === "Sequence"
        ? resources.consumers.sequences.current
        : resources.consumers.regimens.currentRegimen;
      const r = resources.index.references[current || ""];
      const path = resource === "Sequence" ? Path.designerSequences : Path.regimens;
      return path(r?.kind == resource ? urlFriendly(r.body.name) : undefined);
    };
  };
