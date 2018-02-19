FactoryBot.define do
  factory :sensor do
    device
    sequence(:pin)
    label "MyString"
    mode 1
  end
end
