FactoryGirl.define do
  factory :peripheral do
    device
    pin { rand(1..540) }
    mode 1
    label "MyString"
  end
end
