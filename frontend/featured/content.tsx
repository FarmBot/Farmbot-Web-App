import axios from "axios";
import { Color } from "farmbot";
import React from "react";
import { API } from "../api";
import { Content } from "../constants";
import { t } from "../i18next_wrapper";
import { Markdown } from "../ui";

export interface FeaturedSequence {
  id: number;
  path: string;
  name: string;
  description: string;
  color: Color;
}

const FeaturedSequenceRow = (content: FeaturedSequence) =>
  <tr key={content.id}>
    <td>
      {content.name}
      <details>
        <summary>{t("Description")}</summary>
        <div className={"sequence-description"}>
          <Markdown>{content.description || ""}</Markdown>
        </div>
      </details>
    </td>
    <td style={{ verticalAlign: "top" }}>
      <a className={"transparent-link-button"}
        href={API.current.baseUrl + content.path}>
        {t("View")}
      </a>
    </td>
  </tr>;

interface FeaturedSequencePageState {
  sequences: FeaturedSequence[];
}

export class FeaturedSequencePage
  extends React.Component<{}, FeaturedSequencePageState> {
  state: FeaturedSequencePageState = { sequences: [] };

  componentDidMount() {
    API.setBaseUrl(API.fetchBrowserLocation());
    axios.get(API.current.featuredSequencesPath)
      .then(response => this.setState({ sequences: response.data }));
  }

  render() {
    return <div className={"static-page featured-sequences-page"}>
      <div className={"all-content-wrapper"}>
        <h1>{t("Featured Shared Sequences")}</h1>
        <p>{t(Content.FEATURED_SEQUENCES)}</p>
        <table>
          <thead>
            <tr>
              <th style={{ width: "100%" }}>{t("Name")}</th>
              <th>{t("Link")}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.sequences.map(FeaturedSequenceRow)}
          </tbody>
        </table>
      </div>
    </div>;
  }
}
