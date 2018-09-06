FactoryBot.define do
  count = 0
  factory :peripheral do
    device
    pin { count = (count + 1) % 50 }
    label { "MyString" }
  end
end
