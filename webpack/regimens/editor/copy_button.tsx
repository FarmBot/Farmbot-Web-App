import * as React from "react";
import { CopyButtnProps } from "./interfaces";
import { t } from "i18next";
import { init } from "../../api/crud";
import { TaggedRegimen } from "../../resources/tagged_resources";
import { defensiveClone, urlFriendly } from "../../util";
import { push } from "../../history";

export function CopyButton({ dispatch, regimen }: CopyButtnProps) {
  if (regimen) {
    return <button
      className="fb-button yellow"
      onClick={() => dispatch(copy(regimen))}>
      {t("Copy")}
    </button>;
  } else {
    return <span />;
  }
}

let count = 1;
function copy(regimen: TaggedRegimen | undefined) {
  if (regimen) {
    const r = defensiveClone(regimen);
    r.body.name = r.body.name + t(" copy ") + (count++);
    push("/app/regimens/" + urlFriendly(r.body.name));
    r.body.id = undefined;
    return regimen && init(r);
  }
}
