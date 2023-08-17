import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
Enzyme.configure({ adapter: new Adapter() });
