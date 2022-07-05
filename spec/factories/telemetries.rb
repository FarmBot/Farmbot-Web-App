FactoryBot.define do
  factory :telemetry do
    target { Faker::Food.vegetables.first(10) }
    uptime { rand(0...1000) }
    soc_temp { rand(0...100) }
    wifi_level_percent { rand(0...100) }
    memory_usage { rand(0...100) }
    disk_usage { rand(0...100) }
    cpu_usage { rand(0...100) }
    throttled { Faker::Food.vegetables.first(10) }
    fbos_version { "17.0.0" }
    device
  end
end
