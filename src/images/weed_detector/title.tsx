import * as React from "react";
import { t } from "i18next";
import { WeedDetectorConfig } from "./config";
import { WidgetHeader } from "../../ui/index";
import { WD_ENV } from "./remote_env/interfaces";
import { envSave } from "./remote_env/actions";
import { Popover } from "@blueprintjs/core";

type ClickHandler = React.EventHandler<React.MouseEvent<HTMLButtonElement>>;

interface Props {
  onSave?: ClickHandler;
  onTest?: ClickHandler;
  onDeletionClick?: ClickHandler;
  onCalibrate?: ClickHandler;
  deletionProgress?: string | undefined;
  title: string;
  help: string;
  env?: Partial<WD_ENV>;
}

export function TitleBar({
  onSave,
  onTest,
  deletionProgress,
  onDeletionClick,
  onCalibrate,
  env,
  title,
  help
}: Props) {
  return (
    <WidgetHeader helpText={help} title={title}>
      <button
        hidden={!onSave}
        onClick={onSave}
        className="fb-button green" >
        {t("SAVE")}
      </button>
      <button
        hidden={!onTest}
        onClick={onTest}
        className="fb-button yellow" >
        {t("TEST")}
      </button>
      <button
        hidden={!onDeletionClick}
        onClick={onDeletionClick}
        className="fb-button red" >
        {deletionProgress || t("CLEAR WEEDS")}
      </button>
      <button
        hidden={!onCalibrate}
        onClick={() => { }}
        className="fb-button green" >
        {t("Calibrate")}
      </button>
      <Popover>
        <i className="fa fa-cog" />
        {(env && <WeedDetectorConfig
          values={env}
          onChange={envSave} />)}
      </Popover>
    </WidgetHeader>
  );
}
