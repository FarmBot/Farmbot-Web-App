import * as React from "react";
import { transformXY } from "../util";
import { MapTransformProps, BotSize } from "../interfaces";
import { random, range, some, clamp } from "lodash";
import { getEggStatus, setEggStatus, EggKeys } from "./status";

export interface BugsProps {
  mapTransformProps: MapTransformProps;
  botSize: BotSize;
}

type Bug = {
  id: number,
  x: number,
  y: number,
  r: number,
  hp: number,
  alive: boolean
};

interface BugsState {
  bugs: Bug[];
}

export function showBugResetButton() {
  return getEggStatus(EggKeys.BRING_ON_THE_BUGS) === "true";
}

export function showBugs() {
  return getEggStatus(EggKeys.BRING_ON_THE_BUGS) === "true" &&
    getEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE) !== "false";
}

export function resetBugs() {
  setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "true");
}

const BUG_ICON = "/app-resources/img/generic-plant.svg";

export class Bugs extends React.Component<BugsProps, BugsState> {
  state: BugsState = { bugs: [] };

  componentDidMount() {
    this.setState({
      bugs: range(10).map(id => ({
        id,
        x: random(0, this.xMax),
        y: random(0, this.yMax),
        r: random(25, 100),
        hp: 100,
        alive: true
      }))
    });
  }

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
    }
    this.forceUpdate();
  };

  get xMax() { return this.props.botSize.x.value; }
  get yMax() { return this.props.botSize.y.value; }

  render() {
    const toQ = (ox: number, oy: number) =>
      transformXY(ox, oy, this.props.mapTransformProps);
    return <g id="bugs">
      {this.state.bugs.map(bug => {
        const { qx, qy } = toQ(bug.x, bug.y);
        return <image
          key={Object.values(bug).join("-")}
          className={`bug ${bug.alive ? "" : "dead"}`}
          filter={bug.alive ? "" : "url(#grayscale)"}
          opacity={bug.hp / 100}
          xlinkHref={BUG_ICON}
          onClick={() => this.onClick(bug.id)}
          height={bug.r * 2}
          width={bug.r * 2}
          x={qx - bug.r}
          y={qy - bug.r} />;
      })}
    </g>;
  }
}
