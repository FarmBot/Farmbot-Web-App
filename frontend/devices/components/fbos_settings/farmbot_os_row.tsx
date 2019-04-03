import * as React from "react";
import { Row, Col, Markdown } from "../../../ui/index";

import { OsUpdateButton } from "./os_update_button";
import { Popover, Position } from "@blueprintjs/core";
import { ColWidth } from "../farmbot_os_settings";
import { FarmbotOsRowProps } from "./interfaces";
import { FbosDetails } from "./fbos_details";
import { t } from "../../../i18next_wrapper";

const getVersionString =
  (fbosVersion: string | undefined, onBeta: boolean | undefined): string => {
    const needsExtension = fbosVersion && !fbosVersion.includes("-") && onBeta;
    const extension = needsExtension ? "-beta" : "";
    return fbosVersion ? fbosVersion + extension : t(" unknown (offline)");
  };

export function FarmbotOsRow(props: FarmbotOsRowProps) {
  const { sourceFbosConfig, dispatch, bot, osReleaseNotes, botOnline } = props;
  const { controller_version, currently_on_beta
  } = bot.hardware.informational_settings;
  const version = getVersionString(controller_version, currently_on_beta);
  return <Row>
    <Col xs={ColWidth.label}>
      <label>
        {t("FARMBOT OS")}
      </label>
    </Col>
    <Col xs={3}>
      <Popover position={Position.BOTTOM_LEFT}>
        <p>
          {t("Version {{ version }}", { version })}
        </p>
        <FbosDetails
          botInfoSettings={bot.hardware.informational_settings}
          dispatch={dispatch}
          shouldDisplay={props.shouldDisplay}
          sourceFbosConfig={sourceFbosConfig} />
      </Popover>
    </Col>
    <Col xs={3}>
      <Popover position={Position.BOTTOM}>
        <p className="release-notes-button">
          {t("Release Notes")}&nbsp;
          <i className="fa fa-caret-down" />
        </p>
        <div className="release-notes">
          <h1>{props.osReleaseNotesHeading}</h1>
          <Markdown>
            {osReleaseNotes}
          </Markdown>
        </div>
      </Popover>
    </Col>
    <Col xs={3}>
      <OsUpdateButton
        bot={bot}
        sourceFbosConfig={sourceFbosConfig}
        shouldDisplay={props.shouldDisplay}
        botOnline={botOnline} />
    </Col>
  </Row >;
}
