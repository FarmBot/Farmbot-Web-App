require "spec_helper"

describe(InUsePoint) do
  it "is readonly" do
    expect(InUsePoint.new.readonly?).to be(true)
  end
end