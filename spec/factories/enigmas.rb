FactoryBot.define do
  factory :enigma do
    problem_tag { Enigma::PROBLEM_TAGS.sample }
    priority { 100 }
    uuid { SecureRandom.uuid }
    device
  end
end
