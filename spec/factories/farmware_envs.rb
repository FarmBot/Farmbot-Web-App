FactoryBot.define do
  factory :farmware_env do
    device
    key   { Faker::Pokemon.move }
    value { Faker::Pokemon.move }
  end
end
