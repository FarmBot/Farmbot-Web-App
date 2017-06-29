import * as React from "react";
import { mount } from "enzyme";
import { ChangePassword } from "../components";
import { ChangePwPropTypes } from "../interfaces";

describe("<ChangePassword/>", function () {
    it("saves new user password", function () {
        let props: ChangePwPropTypes = {
            password: "wow",
            new_password: "wow",
            new_password_confirmation: "wow",
            set: jest.fn(),
            save: jest.fn()
        };
        let dom = mount(<ChangePassword {...props} />);
        expect(props.save).not.toHaveBeenCalled();
        dom.find("button").simulate("click");
        expect(props.save).toHaveBeenCalled();
        expect(dom.html()).toContain("password");
    });
});
