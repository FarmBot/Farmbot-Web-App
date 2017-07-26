import * as React from "react";
import { isNaN } from "lodash";
import { AxisInputBoxProps, AxisInputBoxState } from "./interfaces";
import { Col, BlurableInput } from "../ui/index";

// export class AxisInputBox
//   extends React.Component<AxisInputBoxProps, AxisInputBoxState> {
//   constructor() {
//     super();
//     this.state = { value: undefined };
//   }

//   whatToDisplay() {
//     if (this.state.value === undefined) {
//       return this.props.value;
//     } else {
//       return this.state.value;
//     }
//   }

//   style() {
//     let border = "1px solid red";
//     return (this.state.value === undefined) ? {} : { border };
//   }

//   componentWillReceiveProps(nextProps: AxisInputBoxProps) {
//     if (this.props.value !== nextProps.value) {
//       this.reset();
//     }
//   }

//   blur = (e: React.FormEvent<HTMLInputElement>) => {
//     switch (this.state.value) {
//       case undefined:
//         return;
//       case "":
//         return this.reset();
//       default:
//         let num = parseFloat(this.state.value);
//         if (isNaN(num)) {
//           return this.reset();
//         } else {
//           return this.props.onChange(this.props.axis, num);
//         }
//     }
//   }

//   reset() {
//     this.setState({ value: undefined });
//     this.props.onChange(this.props.axis, undefined);
//   }

//   change = (e: React.FormEvent<HTMLInputElement>) => {
//     this.setState({ value: e.currentTarget.value });
//   }

//   render() {
//     return (
//       <Col xs={3}>
//         <input className="move-input"
//           type="text"
//           style={this.style()}
//           onBlur={this.blur}
//           onChange={this.change}
//           value={this.whatToDisplay()}
//         />
//       </Col>
//     );
//   }
// }

export let AxisInputBox = ({ onChange, value, axis }: AxisInputBoxProps) => {
  return (
    <Col xs={3}>
      <BlurableInput
        value={(value || -1)}
        type="number"
        onCommit={e => onChange(axis, parseInt(e.currentTarget.value))}
      />
    </Col>
  );
};
