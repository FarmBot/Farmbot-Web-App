require "spec_helper"

describe InUseTool do
  it "is readonly" do
    expect(InUseTool.new.readonly?).to be(true)
  end
end