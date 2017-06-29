import * as React from "react";
import { mount } from "enzyme";
import { Settings } from "../components";
import { SettingsPropTypes } from "../interfaces";

describe("<Settings/>", function () {
    it("saves user settings", function () {
        let props: SettingsPropTypes = {
            name: "new_name",
            email: "new_email",
            set: jest.fn(),
            save: jest.fn()
        };
        let dom = mount(<Settings {...props} />);
        expect(props.save).not.toHaveBeenCalled();
        dom.find("button").simulate("click");
        expect(props.save).toHaveBeenCalled();
    });
});
