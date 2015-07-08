# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :sequence do
    name { Faker::Company.catch_phrase }
    color { Sequence::COLORS.sample }
    device
    steps { FactoryGirl.build_list(:step, 1) }
  end
end
