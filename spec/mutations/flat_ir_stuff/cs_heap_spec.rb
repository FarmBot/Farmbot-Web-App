require "spec_helper"

describe CeleryScript::CsHeap do
  it "raises if address is bad" do
    expect do
      CeleryScript::CsHeap.new.put(CeleryScript::HeapAddress[99], "no", "no")
    end.to raise_error(CeleryScript::CsHeap::BadAddress)
  end
end