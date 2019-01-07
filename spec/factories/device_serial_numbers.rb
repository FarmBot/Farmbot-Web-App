FactoryBot.define do
  factory :device_serial_number do
    device { nil }
    serial_number { raise "Stop using this model" }
  end
end
