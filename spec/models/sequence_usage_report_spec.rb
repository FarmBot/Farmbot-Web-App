require "spec_helper"

describe(SequenceUsageReport) do
  it "is readonly" do
    expect(SequenceUsageReport.new.readonly?).to be(true)
  end
end
