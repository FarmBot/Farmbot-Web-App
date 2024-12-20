import React from "react";
import { connect } from "react-redux";
import { t } from "../../i18next_wrapper";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { Folders } from "../../folders/component";
import { mapStateToProps } from "../state_to_props";
import { SequencesProps } from "../interfaces";
import { publishAction, SectionHeader } from "../sequence_editor_middle_active";
import { Collapse } from "@blueprintjs/core";
import axios from "axios";
import { API } from "../../api";
import { ColorPicker, Markdown, Popover } from "../../ui";
import { Link } from "../../link";
import { Path } from "../../internal_urls";
import { installSequence } from "../actions";
import { SearchField } from "../../ui/search_field";
import {
  addNewSequenceToFolder, createFolder, toggleAll, updateSearchTerm,
} from "../../folders/actions";
import { SequencesPanelState } from "../../interfaces";
import { Actions } from "../../constants";
import { isMobile } from "../../screen_size";
import { NavigationContext } from "../../routes_helpers";
import { useNavigate } from "react-router";
import { Color } from "farmbot";

interface FeaturedSequence {
  id: number;
  path: string;
  name: string;
  description: string;
  color: Color;
}

interface DesignerSequenceListState {
  featuredList: FeaturedSequence[];
  toggleDirection: boolean;
}

export class RawDesignerSequenceList
  extends React.Component<SequencesProps, DesignerSequenceListState> {
  state: DesignerSequenceListState = {
    featuredList: [],
    toggleDirection: true,
  };

  componentDidMount() {
    axios.get(API.current.featuredSequencesPath)
      .then(response => this.setState({ featuredList: response.data }));
  }

  toggleSection = (key: keyof SequencesPanelState) => () =>
    this.props.dispatch({
      type: Actions.TOGGLE_SEQUENCES_PANEL_OPTION,
      payload: key,
    });

  toggleAllFolders = () => {
    toggleAll(this.state.toggleDirection);
    this.setState({ toggleDirection: !this.state.toggleDirection });
  };

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = this.context;

  render() {
    const panelName = "designer-sequence-list";
    const panelState = this.props.sequencesPanelState;
    const buttonProps = Path.inDesigner()
      ? {
        icon: "expand",
        path: Path.sequencePage(),
        text: t("fullscreen"),
      }
      : {
        icon: "compress",
        path: Path.designerSequences(),
        text: t("collapse"),
      };
    return <DesignerPanel panelName={panelName} panel={Panel.Sequences}>
      <DesignerPanelTop panel={Panel.Sequences} withButton={true}>
        <SearchField nameKey={"sequences"}
          searchTerm={this.props.folderData.searchTerm || ""}
          placeholder={t("Search sequences...")}
          onChange={updateSearchTerm} />
        {!isMobile() &&
          <button className={"fb-button clear row half-gap"}
            onClick={() => { this.navigate(buttonProps.path); }}>
            {buttonProps.text}
            <i className={`fa fa-${buttonProps.icon}`} />
          </button>}
      </DesignerPanelTop>
      <DesignerPanelContent panelName={panelName}>
        <SectionHeader title={t("My Sequences")}
          buttonElement={panelState.sequences &&
            <SequenceListActions
              toggleAllFolders={this.toggleAllFolders}
              toggleDirection={this.state.toggleDirection} />}
          collapsed={!panelState.sequences}
          toggle={this.toggleSection("sequences")} />
        <Collapse isOpen={panelState.sequences}>
          <Folders {...this.props.folderData} dispatch={this.props.dispatch} />
        </Collapse>
        <SectionHeader title={t("Featured Sequences")}
          extraClass={"featured-sequence-header"}
          collapsed={!panelState.featured}
          toggle={this.toggleSection("featured")} />
        <Collapse isOpen={panelState.featured}>
          <div className={"folders-panel featured-sequence-list"}>
            {this.state.featuredList
              .filter(item => item.name.toLowerCase()
                .includes((this.props.folderData.searchTerm || "").toLowerCase()))
              .map(item =>
                <FeaturedSequenceListItem key={item.id} item={item} />)}
          </div>
        </Collapse>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerSequenceList =
  connect(mapStateToProps)(RawDesignerSequenceList);
// eslint-disable-next-line import/no-default-export
export default DesignerSequenceList;

interface SequenceListActionsProps {
  toggleAllFolders(): void;
  toggleDirection: boolean;
}

const SequenceListActions = (props: SequenceListActionsProps) => {
  const navigate = useNavigate();
  return <div className={"row"}>
    <button
      className={"fb-button green"}
      title={t("add new sequence")}
      onClick={e => {
        e.stopPropagation();
        addNewSequenceToFolder(navigate);
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
        props.toggleAllFolders();
      }}>
      <i className={`fa fa-chevron-${props.toggleDirection
        ? "right"
        : "down"}`} />
    </button>
  </div>;
};

interface FeaturedSequenceListItemProps {
  item: FeaturedSequence;
}

const FeaturedSequenceListItem = (props: FeaturedSequenceListItemProps) => {
  const { item } = props;
  const [importing, setImporting] = React.useState(false);
  const [descriptionOpen, setDescriptionOpen] = React.useState(false);
  return <li className={"sequence-list-item"}>
    <ColorPicker current={item.color} />
    <Link to={Path.sequenceVersion(item.id)}>
      <p>{item.name}</p>
    </Link>
    <div className={["sequence-list-item-icons",
      descriptionOpen ? "" : "show-on-hover",
    ].join(" ")}>
      {item.description &&
        <Popover popoverClassName={"sequence-item-description"}
          isOpen={descriptionOpen}
          target={<i className={"fa fa-question-circle help-icon"}
            onClick={() => setDescriptionOpen(!descriptionOpen)} />}
          content={<div className={"sequence-item-help help-text-content"}>
            <Markdown>{item.description}</Markdown>
          </div>} />}
      <i className={`fa ${importing ? "fa-spinner fa-pulse" : "fa-download"}`}
        title={t("import this sequence")}
        onClick={() => {
          installSequence(item.id)();
          publishAction(setImporting);
        }} />
    </div>
  </li>;
};
