import * as React from "react";

type OptionComponent =
  | React.ComponentClass<DropDownItem>
  | React.StatelessComponent<DropDownItem>;

export interface DropDownItem {
  /** Name of the item shown in the list. */
  label: string;
  /** Value passed to the onClick cb and also determines the "chosen" option. */
  value: number | string;
  /** To determine group-by styling on rendered lists. */
  heading?: boolean;
  /** A unique ID to group headings by. */
  headingId?: string | undefined;
  /** This is just an idea. */
  children?: DropDownItem[] | undefined
}

export interface SelectProps {
  /** The list of rendered options to select from. */
  list: DropDownItem[];
  /** Determines what label to show in the select box. */
  initialValue?: DropDownItem | undefined;
  /** Determine whether the select list should always be open. */
  isOpen?: boolean;
  /** Custom JSX child rendered instead of a default item. */
  optionComponent?: OptionComponent;
  /** Optional className for `select`. */
  className?: string;
  /** Fires when option is selected. */
  onChange?: (newValue: DropDownItem) => void;
  /** Fires when user enters text */
  onUserTyping?: (userInput: string) => void;
  /** Placeholder for the input. */
  placeholder?: string;
  /** Allows user to have a non-selected value. */
  allowEmpty?: boolean;
  /** Id for the input. Used for accessibility and expected ux with labels. */
  id?: string | undefined;
}

export interface SelectState {
  touched: boolean;
  label: string;
  isOpen: boolean;
  value: string | number | undefined;
}

/** Used as a placeholder for a selection of "none" when allowEmpty is true. */
export const NULL_CHOICE: DropDownItem = Object.freeze({
  label: "None",
  value: ""
});

/** Wow. TSC 2.4 is neat. It found a bunch of subtle issues relating to the ES7
 * object spread operator. For now, I've quieted the errors down by making
 * `FixMe` a strict union of the three interfaces. This is *actually* what FB
 * Select was using for data internally, but TSC did not catch it till now.
 * - RC
 */
type FixMe = SelectProps & SelectState & DropDownItem;

export class DeprecatedFBSelect extends React.Component<Readonly<SelectProps>, Partial<FixMe>> {
  constructor() {
    super();
    this.state = { touched: false };
  }

  componentDidMount() {
    let defaults: Partial<FixMe> = { isOpen: !!this.props.isOpen };
    let { initialValue } = this.props;
    if (initialValue) {
      defaults = { ...defaults, ...initialValue };
    }
    let { allowEmpty } = this.props;
    this.setState(allowEmpty ? { ...NULL_CHOICE, ...defaults } : defaults);
  }

  updateInput = (e: React.SyntheticEvent<HTMLInputElement>) => {
    let { value } = e.currentTarget;
    this.setState({ label: value });
    this.props.onUserTyping && this.props.onUserTyping(value);
  }

  open = () => this.setState({ isOpen: true, label: "" });

  /** Closes the dropdown ONLY IF the developer has not set this.props.isOpen to
   * true, since that would indicate the developer wants it to always be open.
    */
  maybeClose = () => {
    let { list, isOpen } = this.props;
    let { label } = this.state;
    let noLabel = !label;
    let noMatch = (label) ? !this.filterByInput().length : false;
    if (noLabel || noMatch) {
      if (this.props.allowEmpty) {
        this.setState({ ...NULL_CHOICE });
      } else {
        this.setState({ label: "", value: "" });
      }
    };
    this.setState({ isOpen: (isOpen || false) });
  }

  handleSelectOption = (option: DropDownItem) => {
    (this.props.onChange || (() => { }))(option);
    this.setState({
      touched: true,
      label: option.label,
      isOpen: false,
      value: option.value
    });
  }

  custItemList = (items: DropDownItem[]) => {
    if (this.props.optionComponent) {
      let Comp = this.props.optionComponent;
      return items
        .map((p, i) => {
          return <div onMouseDown={() => { this.handleSelectOption(p); }} key={p.value}>
            <Comp {...p} />
          </div>;
        });
    } else {
      throw new Error(`You called custItemList() when props.optionComponent was
      falsy. This should never happen.`);
    }
  }

  normlItemList = (items: DropDownItem[]) => {
    return items.map((option: DropDownItem, i) => {
      let { heading, label } = option;
      let classes = "select-result";
      if (heading) { classes += " is-header"; }
      // TODO: Put this in a shared function when we finish debugging callbacks.
      return <div key={option.value}
        className={classes}
        onMouseDown={() => { this.handleSelectOption(option); }}>
        <label>{label}</label>
      </div>;
    });
  }

  list = () => {
    if (this.props.allowEmpty) {
      return [NULL_CHOICE].concat(this.props.list);
    } else {
      return this.props.list;
    }

  }

  filterByInput = () => {
    return this.list().filter((option: DropDownItem) => {
      let query = (this.state.label || "").toUpperCase();
      return (option.label.toUpperCase().indexOf(query) > -1);
    });
  }

  value = () => {
    if (!this.state.touched && this.props.initialValue) {
      return this.props.initialValue;
    } else {
      return this.state;
    }
  }

  componentWillReceiveProps() {
    setTimeout(() => this.forceUpdate(), 3)
  }

  render() {
    let { className, optionComponent, placeholder } = this.props;
    let { isOpen } = this.state;
    // Dynamically choose custom vs. standard list item JSX based on options:
    let renderList = (optionComponent ? this.custItemList : this.normlItemList);
    return <div className={"select " + (className || "")}>
      <div className="select-search-container">
        <input type="text"
          onChange={this.updateInput || _.noop}
          onFocus={this.open}
          onBlur={this.maybeClose}
          placeholder={placeholder || "Search..."}
          value={this.value().label || ""}
          id={this.props.id || ""} />
      </div>
      <div className={"select-results-container is-open-" + !!isOpen}>
        {renderList(this.filterByInput())}
      </div>
    </div>;
  }
}
