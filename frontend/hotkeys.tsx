import * as React from "react";
import { getLinks } from "./nav/nav_links";
import { sync } from "./devices/actions";
import { push, getPathArray } from "./history";
import { Row, Col } from "./ui/index";
import {
  Hotkey,
  Hotkeys,
  HotkeysTarget,
  IHotkeyProps,
  Overlay,
  Classes
} from "@blueprintjs/core";
import { findIndex } from "lodash";
import { t } from "./i18next_wrapper";
import { unselectPlant } from "./farm_designer/map/actions";

interface Props {
  dispatch: Function;
}

interface State {
  guideOpen: boolean;
}

const hotkeyGuideClasses = [
  "hotkey-guide",
  Classes.CARD,
  Classes.ELEVATION_4
].join(" ");

@HotkeysTarget
export class HotKeys extends React.Component<Props, Partial<State>> {

  state: State = { guideOpen: false };

  render() {
    return <Overlay
      isOpen={this.state.guideOpen}
      onClose={this.toggle("guideOpen")}>
      <div className={hotkeyGuideClasses}>
        <h3>{t("Hotkeys")}</h3>
        <i className="fa fa-times"
          title={t("Close")}
          onClick={this.toggle("guideOpen")} />
        {this.hotkeys(this.props.dispatch, "")
          .map(hotkey => <Row key={hotkey.combo}>
            <Col xs={5}>
              <label>{hotkey.label}</label>
            </Col>
            <Col xs={7}>
              <code>{hotkey.combo}</code>
            </Col>
          </Row>)}
      </div>
    </Overlay>;
  }

  toggle = (property: keyof State) => () =>
    this.setState({ [property]: !this.state[property] });

  hotkeys(dispatch: Function, slug: string) {
    const links = getLinks();
    const idx = findIndex(links, { slug });
    const right = "/app/" + (links[idx + 1] || links[0]).slug;
    const left = "/app/" + (links[idx - 1] || links[links.length - 1]).slug;
    const hotkeyMap: IHotkeyProps[] = [
      {
        combo: "ctrl + shift + s",
        label: "Sync",
        onKeyDown: () => dispatch(sync())
      },
      {
        combo: "ctrl + shift + right",
        label: "Navigate Right",
        onKeyDown: () => push(right)
      },
      {
        combo: "ctrl + shift + left",
        label: "Navigate Left",
        onKeyDown: () => push(left)
      },
      {
        combo: "ctrl + shift + p",
        label: "Add Plant",
        onKeyDown: () => push("/app/designer/plants/crop_search")
      },
      {
        combo: "ctrl + shift + e",
        label: "Add Event",
        onKeyDown: () => push("/app/designer/events/add")
      },
      {
        combo: "esc",
        label: "Back to plant overview",
        onKeyDown: () => {
          push("/app/designer/plants");
          dispatch(unselectPlant(dispatch));
        }
      },
      {
        combo: "ctrl + shift + /",
        label: "Toggle Guide",
        onKeyDown: () => this.toggle("guideOpen")()
      }
    ];
    return hotkeyMap;
  }

  public renderHotkeys() {
    const slug = getPathArray()[2];
    return <Hotkeys>
      {this.hotkeys(this.props.dispatch, slug)
        .map(({ combo, label, onKeyDown }: IHotkeyProps, index: number) =>
          <Hotkey
            key={index}
            global={true}
            combo={combo}
            label={label}
            onKeyDown={onKeyDown} />)}
    </Hotkeys>;
  }
}
