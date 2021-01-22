import React from "react";
import { Content } from "../constants";
import { ExternalUrl } from "../external_urls";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel, DesignerNavTabs } from "../farm_designer/panel_header";
import { t } from "../i18next_wrapper";
import { DevSettings } from "../settings/dev/dev_support";
import { Col, Row } from "../ui";
import { HelpHeader } from "./header";

export const SupportPanel = () =>
  <DesignerPanel panelName={"support"} panel={Panel.Help}>
    <DesignerNavTabs />
    <HelpHeader />
    <DesignerPanelContent panelName={"support"}>
      {DevSettings.futureFeaturesEnabled() &&
        <div className={"priority-support"}>
          <h1>{t("Priority support")}</h1>
          <p>
            {t(Content.PRIORITY_SUPPORT)}
            &nbsp;<b>{t("priority support subscription")}</b>.
            <a className={"inline"}
              href={ExternalUrl.Store.home} target={"_blank"} rel={"noreferrer"}>
              {t("Learn more")}
            </a>
          </p>
          <Row>
            <Col xs={4}>
              <a className={"button"}
                href={"mailto:support@farm.bot"}>
                <b>{t("email")}</b>
                <i>{t("24 hour response time")}</i>
              </a>
            </Col>
            <Col xs={4}>
              <a className={"button"}
                href={""}>
                <b>{t("live chat")}</b>
                <i>{t("M-F 9-5 PST")}</i>
              </a>
            </Col>
            <Col xs={4}>
              <a className={"button"}
                href={""}>
                <b>{t("phone")}</b>
                <i>{t("M-F 9-5 PST")}</i>
              </a>
            </Col>
          </Row>
        </div>}
      <div className={"standard-support"}>
        <h1>{t("Standard support")}</h1>
        <p>
          {t(Content.STANDARD_SUPPORT)}
          <a className={"inline"}
            href={ExternalUrl.Store.home} target={"_blank"} rel={"noreferrer"}>
            {t("Learn more")}
          </a>
        </p>
        <Row>
          <Col xs={4}>
            <a className={"button"}
              href={"mailto:support@farm.bot"}>
              <b>{t("email")}</b>
              <i>{t("72 hour response time")}</i>
            </a>
          </Col>
        </Row>
      </div>
      <div className={"community-support"}>
        <h1>{t("Community help")}</h1>
        <p>
          {t(Content.FORUM_SUPPORT)}
          <a className={"inline"}
            href={ExternalUrl.softwareForum} target={"_blank"} rel={"noreferrer"}>
            {t("FarmBot forum")}
          </a>.
        </p>
      </div>
    </DesignerPanelContent>
  </DesignerPanel>;
