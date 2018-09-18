FactoryBot.define do
  count = 0
  factory :sensor do
    device
    pin { count = (count + 1) % 50 }
    label { "MyString" }
    mode  { 1 }
  end
end
