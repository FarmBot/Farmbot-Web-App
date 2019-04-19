FactoryBot.define do
  factory :alert do
    problem_tag { Alert::PROBLEM_TAGS.sample }
    priority { 100 }
    slug { SecureRandom.uuid }
    device
  end
end
