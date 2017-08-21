import { Everything } from "../interfaces";
import {
  selectAllPeripherals,
  getFeed
} from "../resources/selectors";
import { Props } from "./interfaces";
import { maybeFetchUser } from "../resources/selectors";
import * as _ from "lodash";

export function mapStateToProps(props: Everything): Props {
  let peripherals = _.uniq(selectAllPeripherals(props.resources.index));
  let resources = props.resources;

  return {
    feed: getFeed(resources.index),
    dispatch: props.dispatch,
    bot: props.bot,
    user: maybeFetchUser(props.resources.index),
    resources,
    peripherals
  };
}
