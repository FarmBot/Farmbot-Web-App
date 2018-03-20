# Read about factories at https://github.com/thoughtbot/factory_bot

FactoryBot.define do
  factory :sequence do
    name { Faker::Company.catch_phrase }
    color { Sequence::COLORS.sample }
    device
    kind "sequence"

    after(:create) do |s,t,u|
      CeleryScript::StoreCelery.run!(sequence: s)
    end
  end
end
