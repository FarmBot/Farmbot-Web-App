require "spec_helper"

describe Curves::Update do
  let(:curve) { FactoryBot.create(:curve) }
  let(:device) { FactoryBot.create(:device) }
  let(:user) { FactoryBot.create(:user, device: device) }

  it "updates a curve" do
    props = { curve: curve,
              device: user.device,
              name: "new name" }
    result = Curves::Update.run!(props)
    props.without(:curve, :device).to_a.map { |(k, v)| expect(result.send k).to eq(v) }
  end
end
