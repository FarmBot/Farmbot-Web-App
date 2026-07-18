import React from "react";
import { transformXY } from "../util";
import { MapTransformProps, BotSize } from "../interfaces";
import { random, range, some, clamp, sample } from "lodash";
import { getEggStatus, setEggStatus, EggKeys } from "./status";
import { t } from "../../../i18next_wrapper";
import { Row, ToggleButton } from "../../../ui";
import { BUGS, FilePath, Bug as BugSlug } from "../../../internal_urls";

export interface BugsProps {
  mapTransformProps: MapTransformProps;
  botSize: BotSize;
}

export type Bug = {
  id: number,
  x: number,
  y: number,
  r: number,
  hp: number,
  alive: boolean,
  slug: BugSlug,
};

export interface BugsState {
  bugs: Bug[];
  startTime: number;
}

const bugsEnabled = () => getEggStatus(EggKeys.BRING_ON_THE_BUGS) === "true";
const bugsAlive = () => getEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE) !== "false";
export const showBugResetButton = () => bugsEnabled() && !bugsAlive();
export const showBugs = () => bugsEnabled() && bugsAlive();
const bugStatusListeners = new Set<() => void>();
const notifyBugStatusListeners = () => bugStatusListeners.forEach(callback =>
  callback());
const subscribeToBugStatus = (callback: () => void) => {
  bugStatusListeners.add(callback);
  return () => { bugStatusListeners.delete(callback); };
};
const setBugsEnabled = (enabled: boolean) => {
  setEggStatus(EggKeys.BRING_ON_THE_BUGS, enabled ? "true" : "");
  notifyBugStatusListeners();
};
const toggleBugs = () => setBugsEnabled(!bugsEnabled());
export const disableBugs = () => setBugsEnabled(false);
export const resetBugs = () => {
  setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "true");
  notifyBugStatusListeners();
};
export const useShowBugs = () => React.useSyncExternalStore(
  subscribeToBugStatus,
  showBugs,
  showBugs,
);
const useBugsEnabled = () => React.useSyncExternalStore(
  subscribeToBugStatus,
  bugsEnabled,
  bugsEnabled,
);
const getBugTime = () => getEggStatus(EggKeys.LAST_BUG_TIME);

export const BugsButton = () => {
  const on = useBugsEnabled();
  return <button
    type={"button"}
    className={"bugs-button fb-icon-button invert"}
    title={t(on ? "hide bugs" : "show bugs")}
    aria-label={t(on ? "hide bugs" : "show bugs")}
    onClick={toggleBugs}>
    {on
      ? <i className={"fa fa-bug"} aria-hidden={true} />
      : <span className={"fa-stack"} aria-hidden={true}>
        <i className={"fa fa-bug fa-stack-1x"} />
        <i className={"fa fa-ban fa-stack-2x"} />
      </span>}
  </button>;
};

export abstract class BugAttack<P> extends React.Component<P, BugsState> {
  state: BugsState = { bugs: [], startTime: NaN };

  componentDidMount() {
    this.setState({
      bugs: range(10).map(id => ({
        id,
        x: random(0, this.xMax),
        y: random(0, this.yMax),
        r: random(25, 100),
        hp: 100,
        alive: true,
        slug: sample(BUGS) as BugSlug,
      })),
      startTime: this.seconds
    });
  }

  get seconds() { return Math.floor(new Date().getTime() / 1000); }
  get elapsedTime() { return this.seconds - this.state.startTime; }

  onClick = (id: number) => {
    const bugs = this.state.bugs;
    if (bugs[id].r > 100 && bugs[id].hp > 50) {
      bugs[id].hp = 50;
    } else {
      bugs[id].hp = 50;
      bugs[id].alive = false;
    }
    bugs.map(b => {
      if (b.alive) {
        b.x = clamp(b.x + random(-100, 100), 0, this.xMax);
        b.y = clamp(b.y + random(-100, 100), 0, this.yMax);
        b.r = clamp(b.r + random(0, 10), 0, 150);
      }
    });
    if (!some(bugs, "alive")) {
      setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "false");
      setEggStatus(EggKeys.LAST_BUG_TIME, "" + this.elapsedTime);
    }
    this.forceUpdate();
  };

  abstract get xMax(): number;
  abstract get yMax(): number;
}

export class Bugs extends BugAttack<BugsProps> {
  get xMax() { return this.props.botSize.x.value; }
  get yMax() { return this.props.botSize.y.value; }

  render() {
    const toQ = (ox: number, oy: number) =>
      transformXY(ox, oy, this.props.mapTransformProps);
    return <g id="bugs">
      <filter id="grayscale">
        <feColorMatrix type="saturate" values="0" />
      </filter>
      {this.state.bugs.map(bug => {
        const { qx, qy } = toQ(bug.x, bug.y);
        return <image
          key={Object.values(bug).join("-")}
          className={`bug ${bug.alive ? "" : "dead"}`}
          filter={bug.alive ? "" : "url(#grayscale)"}
          opacity={bug.hp / 100}
          xlinkHref={FilePath.bug(bug.slug)}
          onClick={() => this.onClick(bug.id)}
          height={bug.r * 2}
          width={bug.r * 2}
          x={qx - bug.r}
          y={qy - bug.r} />;
      })}
    </g>;
  }
}

export const BugsControls = () =>
  showBugResetButton()
    ? <div className="more-bugs">
      <button
        className="fb-button green"
        title={t("more bugs!")}
        onClick={resetBugs}>
        {t("more bugs!")}
      </button>
      {getBugTime() &&
        <p style={{ textAlign: "center" }}>
          {t("{{seconds}} seconds!", { seconds: getBugTime() })}
        </p>}
    </div>
    : <div className={"no-bugs"} />;

interface SettingProps {
  title: string;
}

const Setting = (props: SettingProps) => {
  const { title } = props;
  const on = useBugsEnabled();
  return <Row className={"setting grid-exp-1"}>
    <label>{title}</label>
    <ToggleButton
      toggleValue={on}
      toggleAction={toggleBugs} />
  </Row>;
};

export const BugsSettings = () => {
  return <div className={"settings"}>
    <Setting
      title={"Bug Attack"} />
  </div>;
};
