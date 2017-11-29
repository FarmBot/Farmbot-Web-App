require 'spec_helper'
require_relative "scenario"

describe Points::Destroy do
  it "prevents deletion of active tool slots" do
    s      = Points::Scenario.new
    result = Points::Destroy.run(points: [s.tool_slot], device: s.device)
    expect(result.success?).to be(false)
    expect(result.errors.message_list)
      .to include(Points::Destroy::STILL_IN_USE % s.sequence.name)
  end
end
