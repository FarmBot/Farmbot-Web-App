require "spec_helper"

describe Curves::Create do
  let(:device) { FactoryBot.create(:device) }
  let(:params) do
    { device: device, name: "My Curve", type: "water", data: { 1 => 1 } }
  end

  it "creates a curve" do
    p = { device: FactoryBot.create(:device),
          name: "My Curve",
          type: "water",
          data: { 1 => 1 } }
    curve = Curves::Create.run!(p)

    p.map { |(k, v)| expect(curve.send(k)).to eq(v) }
  end
end
