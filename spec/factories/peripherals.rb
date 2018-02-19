FactoryBot.define do
  factory :peripheral do
    device
    sequence(:pin)
    label "MyString"
  end
end
