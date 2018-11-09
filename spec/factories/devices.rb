FactoryBot.define do
  factory :device do
    name  { Faker::Food.vegetables }
    timezone { Device::TIMEZONES.sample }
  end
end
