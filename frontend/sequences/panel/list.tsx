import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../../farm_designer/designer_panel";
import { DesignerNavTabs, Panel } from "../../farm_designer/panel_header";
import { Folders } from "../../folders/component";
import { mapStateToProps } from "../state_to_props";
import { SequencesProps } from "../interfaces";
import { t } from "../../i18next_wrapper";
import { SectionHeader } from "../sequence_editor_middle_active";
import { Collapse } from "@blueprintjs/core";
import { FeaturedSequence } from "../../featured/content";
import axios from "axios";
import { API } from "../../api";
import { Help } from "../../ui";
import { Link } from "../../link";
import { Path } from "../../internal_urls";
import { installSequence } from "../actions";
import { SearchField } from "../../ui/search_field";
import {
  addNewSequenceToFolder, createFolder, toggleAll, updateSearchTerm,
} from "../../folders/actions";

interface DesignerSequenceListState {
  sequences: boolean;
  featured: boolean;
  featuredList: FeaturedSequence[];
  toggleDirection: boolean;
}

export class RawDesignerSequenceList
  extends React.Component<SequencesProps, DesignerSequenceListState> {
  state: DesignerSequenceListState = {
    sequences: true,
    featured: false,
    featuredList: [],
    toggleDirection: false,
  };

  componentDidMount() {
    axios.get(API.current.featuredSequencesPath)
      .then(response => this.setState({ featuredList: response.data }));
  }

  toggleSection = (key: keyof DesignerSequenceListState) => () =>
    this.setState({ ...this.state, [key]: !this.state[key] });

  toggleAllFolders = () => {
    toggleAll(this.state.toggleDirection);
    this.setState({ toggleDirection: !this.state.toggleDirection });
  };

  render() {
    const panelName = "designer-sequence-list";
    return <DesignerPanel panelName={panelName} panel={Panel.Sequences}>
      <DesignerNavTabs />
      <DesignerPanelTop panel={Panel.Sequences}>
        <SearchField searchTerm={this.props.folderData.searchTerm || ""}
          placeholder={t("Search sequences...")}
          onChange={updateSearchTerm} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={panelName}>
        <SectionHeader title={t("My Sequences")}
          buttonElement={this.state.sequences &&
            <div className={"folder-icon-wrapper"}>
              <button
                className={"fb-button green"}
                title={t("add new sequence")}
                onClick={e => {
                  e.stopPropagation();
                  addNewSequenceToFolder();
                }}>
                <i className={"fa fa-plus"} />
              </button>
              <button
                className={"fb-button green"}
                title={t("Create subfolder")}
                onClick={e => {
                  e.stopPropagation();
                  createFolder();
                }}>
                <i className={"fa fa-folder"} />
              </button>
              <button className="fb-button gray"
                title={t("toggle folder open")}
                onClick={e => {
                  e.stopPropagation();
                  this.toggleAllFolders();
                }}>
                <i className={`fa fa-chevron-${this.state.toggleDirection
                  ? "right"
                  : "down"}`} />
              </button>
            </div>}
          collapsed={!this.state.sequences}
          toggle={this.toggleSection("sequences")} />
        <Collapse isOpen={this.state.sequences}>
          <Folders {...this.props.folderData} dispatch={this.props.dispatch} />
        </Collapse>
        <SectionHeader title={t("Featured Sequences")}
          extraClass={"featured-sequence-header"}
          collapsed={!this.state.featured}
          toggle={this.toggleSection("featured")} />
        <Collapse isOpen={this.state.featured}>
          <div className={"folders-panel"}>
            {this.state.featuredList
              .filter(s => s.name.toLowerCase()
                .includes((this.props.folderData.searchTerm || "").toLowerCase()))
              .map(s =>
                <li className={"sequence-list-item"} key={s.id}>
                  <Link to={Path.sequenceVersion(s.id)}>
                    <p>{s.name}</p>
                  </Link>
                  <div className={"sequence-list-item-icons show-on-hover"}>
                    <Help text={s.description || ""} enableMarkdown={true} />
                    <i className={"fa fa-download"}
                      title={t("import this sequence")}
                      onClick={() => { installSequence(s.id)(); }} />
                  </div>
                </li>)}
          </div>
        </Collapse>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerSequenceList =
  connect(mapStateToProps)(RawDesignerSequenceList);
