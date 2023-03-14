require 'spec_helper'

describe Curve do
  let(:curve) { FactoryBot.create(:curve) }

  it "requires a type" do
    result = curve.update(type: nil)
    expect(result).to be(false)
    expect(curve.errors.messages[:type].to_s).to include("not valid")
  end
end
