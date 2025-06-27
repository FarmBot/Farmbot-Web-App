require "spec_helper"

describe Peripheral do
  it 'requires a device' do
    peripheral = Peripheral.new(pin: 1, label: "LED")
    expect(peripheral.valid?).to be false
    expect(peripheral.errors[:device]).to include("can't be blank")
  end

  it 'requires a pin' do
    device = Device.create!
    peripheral = Peripheral.new(device: device, label: "LED")
    expect(peripheral.valid?).to be false
    expect(peripheral.errors[:pin]).to include("can't be blank")
  end

  it 'requires a label' do
    device = Device.create!
    peripheral = Peripheral.new(device: device, pin: 1)
    expect(peripheral.valid?).to be false
    expect(peripheral.errors[:label]).to include("can't be blank")
  end

  it 'validates pin uniqueness scoped to device' do
    device = Device.create!
    Peripheral.create!(device: device, pin: 5, label: "LED")
    dup = Peripheral.new(device: device, pin: 5, label: "Temp Probe")
    expect(dup.valid?).to be false
    expect(dup.errors[:pin]).to include("has already been taken")
  end

  it 'allows same pin on different devices' do
    device1 = Device.create!
    device2 = Device.create!
    Peripheral.create!(device: device1, pin: 10, label: "LED")
    other = Peripheral.new(device: device2, pin: 10, label: "LED")
    expect(other.valid?).to be true
  end

  it 'validates pin is an integer between 0 and 1000' do
    device = Device.create!
    invalid = Peripheral.new(device: device, pin: -1, label: "LED")
    expect(invalid.valid?).to be false
    expect(invalid.errors[:pin]).to include("must be greater than or equal to 0")

    invalid = Peripheral.new(device: device, pin: 1001, label: "LED")
    expect(invalid.valid?).to be false
    expect(invalid.errors[:pin]).to include("must be less than or equal to 1000")

    invalid = Peripheral.new(device: device, pin: 1.5, label: "LED")
    expect(invalid.valid?).to be false
    expect(invalid.errors[:pin]).to include("must be an integer")
  end
end
