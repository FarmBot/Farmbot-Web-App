FactoryBot.define do
  factory :device_config do
    device
    key   { Faker::Pokemon.move }
    value { Faker::Pokemon.move }
  end
end
