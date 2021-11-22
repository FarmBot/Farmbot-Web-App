FactoryBot.define do
  factory :device do
    name { Faker::Food.vegetables }
    timezone { Device::TIMEZONES.sample }
    serial_number { SecureRandom.hex(16) }
    fbos_version { "17.0.0" }
  end
end
