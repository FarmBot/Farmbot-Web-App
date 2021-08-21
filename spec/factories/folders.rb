FactoryBot.define do
  factory :folder do
    device
    color { Sequence::COLORS.sample }
    name { Faker::Book.genre }
  end
end
