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
import { colors, urlFriendly } from "../../util";
import { edit, save } from "../../api/crud";
import {
  Color,
  TaggedCurve,
  TaggedPoint, TaggedPointGroup, TaggedRegimen, TaggedSequence,
} from "farmbot";
import { Path } from "../../internal_urls";
import { requestAutoGeneration } from "../request_auto_generation";
import { error } from "../../toast/toast";
import { noop } from "lodash";
import { addNewSequenceToFolder } from "../../folders/actions";

interface SequencesState {
  processingTitle: boolean;
  processingColor: boolean;
}

export class RawDesignerSequenceEditor
  extends React.Component<SequencesProps, SequencesState> {
  state: SequencesState = {
    processingTitle: false,
    processingColor: false,
  };

  componentDidMount() {
    if (!this.props.sequence) { setActiveSequenceByName(); }
  }

  get isProcessing() {
    return this.state.processingColor || this.state.processingTitle;
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
          {sequence &&
            <AutoGenerateButton
              dispatch={this.props.dispatch}
              sequence={sequence}
              isProcessing={this.isProcessing}
              setTitleProcessing={processingTitle =>
                this.setState({ processingTitle })}
              setColorProcessing={processingColor =>
                this.setState({ processingColor })} />}
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
          {!sequence && <button
            className={"fb-button green"}
            title={t("add new sequence")}
            onClick={() => addNewSequenceToFolder()}>
            <i className="fa fa-plus" />
          </button>}
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
            sequencesState={this.props.sequencesState} />}
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

interface AutoGenerateButtonProps {
  dispatch: Function;
  sequence: TaggedSequence;
  isProcessing: boolean;
  setTitleProcessing(state: boolean): void;
  setColorProcessing(state: boolean): void;
}

const AutoGenerateButton = (props: AutoGenerateButtonProps) => {
  const {
    dispatch, sequence, isProcessing, setTitleProcessing, setColorProcessing,
  } = props;
  return <i title={t("auto-generate sequence title and color")}
    className={`fa fa-${isProcessing
      ? "spinner fa-pulse"
      : "magic"}`}
    onClick={() => {
      if (!sequence.body.id) {
        error(t("Save sequence first."));
        return;
      }
      setTitleProcessing(true);
      const updateTitle = (title: string) =>
        dispatch(edit(sequence, { name: title.replace(/"*/g, "") }));
      requestAutoGeneration({
        contextKey: "title",
        sequenceId: sequence.body.id,
        onUpdate: title => {
          updateTitle(title);
        },
        onSuccess: title => {
          setTitleProcessing(false);
          updateTitle(title);
        },
        onError: () => setTitleProcessing(false),
      });
      setColorProcessing(true);
      requestAutoGeneration({
        contextKey: "color",
        sequenceId: sequence.body.id,
        onUpdate: noop,
        onSuccess: potentialColor => {
          setColorProcessing(false);
          const pColor = potentialColor.toLowerCase().split(".")[0];
          const color = colors.includes(pColor as Color)
            ? pColor
            : "gray";
          dispatch(edit(sequence, {
            color: color as Color
          }));
        },
        onError: () => setColorProcessing(false),
      });
    }} />;
};

export const DesignerSequenceEditor =
  connect(mapStateToProps)(RawDesignerSequenceEditor);
