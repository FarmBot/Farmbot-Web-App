import React from "react";
import { Page } from "../ui";
import { t } from "../i18next_wrapper";
import { useNavigate } from "react-router-dom";
import { Path } from "../internal_urls";

/** Messages page redirect. */
export const Messages = () => {
  const navigate = useNavigate();
  navigate(Path.messages());
  return <Page className="messages-page">
    <p>{t("This page has moved. Redirecting...")}</p>
  </Page>;
};

// eslint-disable-next-line import/no-default-export
export default Messages;
