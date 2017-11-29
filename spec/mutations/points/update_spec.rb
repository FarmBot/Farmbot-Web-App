require 'spec_helper'
require_relative "scenario"

describe Points::Update do
  it "prevents remove of tool from actively used tool slots"
  # Create a tool
  # Create a tool slot with tool attached
  # Create a sequence that uses it
  # Call Points::Update and remove the tool from the slot
  # Expect an error
end
