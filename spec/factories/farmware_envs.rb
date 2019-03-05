FactoryBot.define do
  factory :farmware_env do
    device
    key   { Faker::Games::Pokemon.move }
    value { Faker::Games::Pokemon.move }
  end
end
