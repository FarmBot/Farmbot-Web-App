require 'spec_helper'
require_relative "scenario"

describe Points::Destroy do
  it "prevents deletion of active tool slots" do
    # Call Points::Destroy
    # Expect an error
    s = Points::Scenario.new
  end
end
