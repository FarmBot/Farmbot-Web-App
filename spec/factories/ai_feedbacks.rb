FactoryBot.define do
  factory :ai_feedback do
    device
    prompt { Faker::Games::Pokemon.name }
    reaction { %w(good bad).sample }
  end
end
