# Read about factories at https://github.com/thoughtbot/factory_bot

FactoryBot.define do
  factory :wizard_step_result do
    device
    slug { Faker::Games::Pokemon.name }
    outcome { Faker::Games::Pokemon.move }
    answer { (rand * 10) > 5 }
  end
end
