FactoryBot.define do
  factory :device do
    name  { Faker::Food.vegetables }
    timezone { Device::TIMEZONES.sample }
    serial_number { SecureRandom.hex(16)}
  end
end
