require "spec_helper"

describe "Legacy models" do
  it "does not broadcast the changes" do
    x = [LegacyToolSlot, LegacyGenericPointer, LegacyPlant]
      .map(&:new)
      .map(&:broadcast?)
    expect(x).to eq([false, false, false])
  end
end
