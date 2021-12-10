FactoryBot.define do
  factory :farmware_env do
    device
    key { Faker::Games::Pokemon.move + SecureRandom.hex(2) }
    value { Faker::Games::Pokemon.move }
  end
end
