require "spec_helper"

describe CeleryScript::CSHeap do
  it "raises if address is bad" do
    expect do
      CeleryScript::CSHeap.new.put(CeleryScript::HeapAddress[99], "no", "no")
    end.to raise_error(CeleryScript::CSHeap::BadAddress)
  end
end