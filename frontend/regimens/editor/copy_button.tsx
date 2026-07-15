import React from "react";
import { CopyButtonProps } from "./interfaces";
import { useNavigate } from "react-router";
import { t } from "../../i18next_wrapper";
import { copyRegimen } from "../copy_regimen";

export const CopyButton = ({ dispatch, regimen }: CopyButtonProps) => {
  const navigate = useNavigate();
  return <i className={"fa fa-clone fb-icon-button"}
    title={t("copy")}
    onClick={() => dispatch(copyRegimen(navigate, regimen))} />;
};
