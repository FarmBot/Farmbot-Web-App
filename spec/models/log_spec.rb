require 'spec_helper'

describe Log do
  let(:device) { Device.create!(name: "Test Device") }

  it "is invalid without a device" do
    log = Log.new(type: "info")
    expect(log).not_to be_valid
    expect(log.errors[:device]).to include("can't be blank")
  end

  it "sets channels to an empty array by default" do
    log = Log.new(device: device, type: "info")
    log.valid?
    expect(log.channels).to eq([])
  end

  it "does not broadcast by default" do
    log = Log.new(device: device, type: "info")
    expect(log.broadcast?).to be false
  end
end
