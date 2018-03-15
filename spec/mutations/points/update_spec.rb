require 'spec_helper'
require_relative "scenario"

describe Points::Update do
  it "prevents remove of tool from actively used tool slots" do
    s      = Points::Scenario.new
    result = Points::Update.run(device:  s.device,
                                point:   s.tool_slot,
                                tool_id: nil)
    expect(result.success?).to be(false)
    expect(result.errors.message_list).to include(Tool::IN_USE % s.sequence[:name])
  end
end
