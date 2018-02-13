FactoryBot.define do
  factory :peripheral do
    device
    pin { rand(1..540) }
    label "MyString"
  end
end
