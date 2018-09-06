FactoryBot.define do
  factory :webcam_feed do
    device
    url { "http://placehold.it/320x240" }
  end
end
