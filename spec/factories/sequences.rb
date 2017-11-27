# Read about factories at https://github.com/thoughtbot/factory_bot

FactoryBot.define do
  factory :sequence do
    name { Faker::Company.catch_phrase }
    color { Sequence::COLORS.sample }
    device
    kind "sequence"
    args({
      version: 4 # Hard coding it for now - RC Nov 22
    })
    body([])
  end
end
