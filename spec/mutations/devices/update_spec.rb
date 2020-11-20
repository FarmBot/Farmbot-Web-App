require "spec_helper"

describe Devices::Update do
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  it "updates an existing device" do
    previous_name = device.name
    p = { name: "Farmbot1231231" }
    Devices::Update.run!({ device: device }, p)
    device.reload
    expect(device.name).to eq(p[:name])
  end
end
