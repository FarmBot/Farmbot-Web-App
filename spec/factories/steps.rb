# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :step do
    message_type
    time_stamp { Time.now }
    command
  end
end
