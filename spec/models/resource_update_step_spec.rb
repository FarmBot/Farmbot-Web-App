require "spec_helper"

describe ResourceUpdateStep do
  it "is readonly" do
    expect(ResourceUpdateStep.new.readonly?).to be(true)
  end
end
