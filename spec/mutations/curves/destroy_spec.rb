require "spec_helper"

describe Curves::Destroy do
  let(:curve) { FactoryBot.create(:curve) }
  let(:device) { FactoryBot.create(:device) }
  let(:user) { FactoryBot.create(:user, device: device) }

  it "destroys a curve" do
    id     = curve.id
    result = Curves::Destroy.run!(curve: curve, device: user.device)
    expect(Curve.exists?(id)).to be false
  end
end
