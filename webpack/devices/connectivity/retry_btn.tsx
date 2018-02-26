import * as React from "react";
import { SpecialStatus } from "../../resources/tagged_resources";
import { t } from "i18next";

interface RetryBtnProps {
  flags: boolean[];
  onClick(): void;
  status: SpecialStatus;
}

export function RetryBtn(props: RetryBtnProps) {
  const failures = props.flags.includes(false);
  const color = failures ? "red" : "green";
  const css = props.status === "SAVING" ? "yellow" : color;
  return <button
    className={css + " fb-button"}
    onClick={props.onClick}>
    {t("Check Again")}
</button>;
}
