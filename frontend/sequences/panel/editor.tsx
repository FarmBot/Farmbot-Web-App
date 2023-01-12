import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { mapStateToProps } from "../state_to_props";
import { SequencesProps } from "../interfaces";
import { t } from "../../i18next_wrapper";
import { EmptyStateWrapper, EmptyStateGraphic, ColorPicker } from "../../ui";
import {
  SequenceEditorMiddleActive,
} from "../sequence_editor_middle_active";
import { Content } from "../../constants";
import { isTaggedSequence } from "../../resources/tagged_resources";
import {
  setActiveSequenceByName,
} from "../set_active_sequence_by_name";
import { push } from "../../history";
import { urlFriendly } from "../../util";
import { edit, save } from "../../api/crud";
import {
  TaggedCurve,
  TaggedPoint, TaggedPointGroup, TaggedRegimen, TaggedSequence,
} from "farmbot";
import { Path } from "../../internal_urls";

export class RawDesignerSequenceEditor extends React.Component<SequencesProps> {

  componentDidMount() {
    if (!this.props.sequence) { setActiveSequenceByName(); }
  }

  render() {
    const panelName = "designer-sequence-editor";
    const { sequence } = this.props;
    return <DesignerPanel panelName={panelName} panel={Panel.Sequences}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Sequences}
        colorClass={sequence?.body.color}
        titleElement={<ResourceTitle
          key={sequence?.body.name}
          resource={sequence}
          fallback={t("No Sequence selected")}
          dispatch={this.props.dispatch} />}
        backTo={Path.sequences()}>
        <div className={"panel-header-icon-group"}>
          {sequence && <ColorPicker
            current={sequence.body.color || "gray"}
            targetElement={<i title={t("select color")}
              className={"icon-saucer fa fa-paint-brush"} />}
            onChange={color => this.props.dispatch(edit(sequence, { color }))} />}
          {sequence && window.innerWidth > 450 &&
            <i className={"fa fa-expand"}
              title={t("open full-page editor")}
              onClick={() =>
                push(Path.sequencePage(urlFriendly(sequence.body.name)))} />}
        </div>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={panelName}>
        <EmptyStateWrapper
          notEmpty={sequence && isTaggedSequence(sequence)}
          graphic={EmptyStateGraphic.sequences}
          title={t("No Sequence selected.")}
          text={Content.NO_SEQUENCE_SELECTED}>
          {sequence && <SequenceEditorMiddleActive
            showName={false}
            dispatch={this.props.dispatch}
            sequence={sequence}
            sequences={this.props.sequences}
            resources={this.props.resources}
            syncStatus={this.props.syncStatus}
            hardwareFlags={this.props.hardwareFlags}
            farmwareData={this.props.farmwareData}
            getWebAppConfigValue={this.props.getWebAppConfigValue}
            visualized={this.props.visualized}
            hoveredStep={this.props.hoveredStep}
            menuOpen={this.props.menuOpen} />}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export interface ResourceTitleProps {
  dispatch: Function;
  resource: TaggedSequence
  | TaggedRegimen
  | TaggedPoint
  | TaggedPointGroup
  | TaggedCurve
  | undefined;
  readOnly?: boolean;
  fallback: string;
  save?: boolean;
}

export const ResourceTitle = (props: ResourceTitleProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [nameValue, setNameValue] = React.useState(props.resource?.body.name);
  return isEditing
    ? <input
      value={nameValue}
      autoFocus={true}
      onBlur={() => {
        setIsEditing(false);
        props.resource && props.dispatch(edit(props.resource, { name: nameValue }));
        props.save && props.resource && props.dispatch(save(props.resource.uuid));
      }}
      onChange={e => {
        setNameValue(e.currentTarget.value);
      }} />
    : <span className={"title white-text"}
      style={props.readOnly ? { pointerEvents: "none" } : {}}
      title={t("click to edit")}
      onClick={() => setIsEditing(true)}>
      {props.resource?.body.name || props.fallback}
    </span>;
};

export const DesignerSequenceEditor =
  connect(mapStateToProps)(RawDesignerSequenceEditor);
