import axios from "axios";
import React from "react";
import { API } from "../api";
import { Content } from "../constants";
import { ExternalUrl } from "../external_urls";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel } from "../farm_designer/panel_header";
import { useNavigate } from "react-router";
import { t } from "../i18next_wrapper";
import { Path } from "../internal_urls";
import { store } from "../redux/store";
import { maybeGetDevice } from "../resources/selectors";
import { DevSettings } from "../settings/dev/dev_support";
import { success } from "../toast/toast";
import { Help, Row } from "../ui";
import { WizardStepSlug } from "../wizard/data";
import { HelpHeader } from "./header";

export const SupportPanel = () =>
  <DesignerPanel panelName={"support"} panel={Panel.Help}>
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
          <Row className="grid-3-col">
            <a className={"button"}
              href={"mailto:support@farm.bot"}>
              <b>{t("email")}</b>
              <i>{t("24 hour response time")}</i>
            </a>
            <a className={"button"}
              href={""}>
              <b>{t("live chat")}</b>
              <i>{t("M-F 9-5 PST")}</i>
            </a>
            <a className={"button"}
              href={""}>
              <b>{t("phone")}</b>
              <i>{t("M-F 9-5 PST")}</i>
            </a>
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
        <Row className="grid-3-col">
          <a className={"button"}
            href={"mailto:support@farm.bot"}>
            <b>{t("email")}</b>
            <i>{t("72 hour response time")}</i>
          </a>
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
      <div className={"feedback-support"}>
        <h1>{t("Provide feedback")}</h1>
        <Feedback />
      </div>
    </DesignerPanelContent>
  </DesignerPanel>;

interface FeedbackProps {
  stepSlug?: WizardStepSlug;
  keep?: boolean;
}

export const Feedback = (props: FeedbackProps) => {
  const [message, setMessage] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const orderNumber =
    maybeGetDevice(store.getState().resources.index)?.body.fb_order_number;
  const navigate = useNavigate();
  return <div className={"feedback"}>
    <textarea value={message} onChange={e => {
      setSent(false);
      setMessage(e.currentTarget.value);
    }} />
    <p>{t(Content.FEEDBACK_NOTICE)}</p>
    <button className={`fb-button ${sent ? "gray" : "green"}`}
      disabled={!orderNumber}
      onClick={() => {
        sent
          ? success(t("Feedback already sent."))
          : axios.post(API.current.feedbackPath, { message, slug: props.stepSlug })
            .then(() => {
              success(t("Feedback sent."));
              props.keep ? setSent(true) : setMessage("");
            });
      }}>
      {sent ? t("submitted") : t("submit")}
    </button>
    {!orderNumber && <Help text={Content.MUST_REGISTER} links={[
      <a key={0}
        onClick={() => { navigate(Path.settings("order_number")); }}>
        &nbsp;{t("Register your ORDER NUMBER")}
        <i className={"fa fa-external-link"} />
      </a>]} />}
  </div>;
};

// eslint-disable-next-line import/no-default-export
export default SupportPanel;
