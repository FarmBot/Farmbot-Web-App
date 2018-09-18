FactoryBot.define do
  factory :log_dispatch do
    device
    log
    sent_at { "2017-05-25 06:16:55" }
  end
end
