FactoryBot.define do
  factory :enigma do
    problem_tag { "api.seed_data.missing" }
    priority { 100 }
    uuid { SecureRandom.uuid }
    device
  end
end
