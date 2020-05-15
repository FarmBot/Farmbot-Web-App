import { store } from "../redux/store";
import { urlFriendly } from "../util";
import { LinkComputeFn } from "./nav_links";
import { DevSettings } from "../account/dev/dev_support";

export const computeEditorUrlFromState =
  (resource: "Sequence" | "Regimen"): LinkComputeFn => {
    return () => {
      const { resources } = store.getState();
      const current = resource === "Sequence"
        ? resources.consumers.sequences.current
        : resources.consumers.regimens.currentRegimen;
      const r = resources.index.references[current || ""];
      const base = `/app/${resource === "Sequence" ? "sequences" : "regimens"}/`;
      if (r?.kind == resource) {
        return base + urlFriendly(r.body.name);
      } else {
        return base;
      }
    };
  };

export const computeFarmwareUrlFromState = () => {
  const current = store.getState().resources.consumers.farmware.currentFarmware;
  const base = `/app${
    DevSettings.futureFeaturesEnabled() ? "/designer" : ""}/farmware/`;
  return base + (current ? urlFriendly(current) : "");
};
