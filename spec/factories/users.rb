# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :user do
    device
    name { Faker::Name.name }
    email { Faker::Internet.email }
    password { Faker::Internet.password(8) }
    after(:create) { |user| user.device ||= Devices::Create.run!(user: resp[:user]) }
  end
end
