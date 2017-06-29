import * as React from "react";
import * as _ from "lodash";
import {
  TaggedResource,
  TaggedPlantPointer
} from "../resources/tagged_resources";

interface Props {
  /** Allow user to select no value. */
  allowEmpty?: boolean;
  /** Value to show. */
  selectedItem?: TaggedResource | undefined;
  /** Event emitter for user typing. */
  onChange?(selection: TaggedResource): void;
  /** All possible select options in TaggedResource format. */
  resourceList?: TaggedResource[];
  /** Text shown before user selection. */
  placeholder?: string | undefined;
  /** Determines whether the list of options should remain open. */
  forceOpen?: boolean;
  /** Custom component to be rendered. */
  optionComponent(tr: TaggedResource): JSX.Element;
  /** Sometimes `dispatch` is needed. */
  dispatch?: Function | undefined;
}

type State = {
  isOpen: boolean;
  input: string;
}

type OptionComponent =
  | React.ComponentClass<TaggedResource>
  | React.StatelessComponent<TaggedResource>;

export class CustomFBSelect extends React.Component<Props, Partial<State>> {

  state: State = { isOpen: true, input: "" };

  handleChange = (input: string) => this.setState({ input });

  toggle = (name: keyof State) =>
    () => this.setState({ [name]: !this.state[name] });

  render() {
    let { isOpen } = this.state;
    let placeholder = this.props.placeholder || "Search...";
    let val = this.props.selectedItem && this.props.selectedItem.body.id;
    let shouldToggle = this.props.forceOpen ? _.noop : this.toggle("isOpen");
    let list = this.props.resourceList;

    return <div
      className="select"
      onClick={shouldToggle}>
      <div className="select-search-container">
        <input
          type="text"
          placeholder={placeholder}
          value={val}
          onChange={e => this.handleChange(e.currentTarget.value)} />
      </div>
      <div
        className={"select-results-container is-open-" + !!isOpen}>
        {list && list.map((x: TaggedPlantPointer) => {
          let comp = this.props.optionComponent;
          let name = x.body.name.toLowerCase();
          let input = this.state.input.toLowerCase();
          let condition = name.includes(input);
          return condition && comp && comp(x);
        })}
      </div>
    </div>;
  }
}
