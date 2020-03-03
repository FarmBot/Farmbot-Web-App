import * as React from "react";
import {
  Widget, WidgetBody, WidgetHeader, docLink, DOC_SLUGS, DocSlug,
} from "../ui";
import { t } from "../i18next_wrapper";

const documentationLink = (slug: DocSlug, label: string) =>
  <a href={docLink(slug)}
    target="_blank">
    {t(label)}<i className="fa fa-external-link" />
  </a>;

const documentationLinkMapper = ([slug, label]: [DocSlug, string]) =>
  slug !== "the-farmbot-web-app" &&
  <div key={slug}>{documentationLink(slug, label)}</div>;

export const DocsWidget = () =>
  <Widget className="documentation-widget">
    <WidgetHeader title={t("Documentation")} />
    <WidgetBody>
      <div className={"general-doc-links"}>
        <label>{t("General")}</label>
        <div className={"web-app-doc-link"}>
          {documentationLink("the-farmbot-web-app", "Web App")}
        </div>
      </div>
      <div className={"specific-doc-links"}>
        <label>{t("Topics")}</label>
        {Object.entries(DOC_SLUGS).map(documentationLinkMapper)}
      </div>
    </WidgetBody>
  </Widget>;
