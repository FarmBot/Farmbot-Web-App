devices = Device.all

1_000_000.times do |num|
  puts "Load test #{num}"
  devices.map { |x| x.tell("LOAD TEST IN PROGRESS: #{num}") }
  sleep 0.05
end
