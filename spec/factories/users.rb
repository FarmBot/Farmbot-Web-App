# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :user do
    name  Faker::Name.name
    email Faker::Internet.email
    password Faker::Internet.password(8)
    after(:create) do |user|
      FactoryGirl.create(:device, user: user)
    end
  end
end
