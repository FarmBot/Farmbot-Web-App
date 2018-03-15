require "spec_helper"

describe CeleryScript::HeapAddress do
  EXAMPLE = CeleryScript::HeapAddress[42]

  it "stringifies" do
    expect(EXAMPLE.to_s).to eq("42")
  end

  it "inspects" do
    expect(EXAMPLE.inspect).to eq("HeapAddress(42)")
  end
end